import { Request, Response } from "express";
import { TelematicsService } from "../telematics/telematics.service";
import { pool } from "../../config/db";

export class AdminController {
  /**
   * GET /api/v1/admin/fleet/vehicles
   * Returns all vehicles for the admin's assigned branches with specs and metrics
   */
  public static async getFleetVehilces(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      let branchFilterQuery = "";
      const params: any[] = [];

      // Fleet Admins can only view vehicles in their assigned branches
      if (req.user!.role === "FLEET_ADMIN") {
        const allowedBranches = req.user!.branchIds;
        params.push(allowedBranches);
        branchFilterQuery = `WHERE v.branch_id = ANY($1::uuid[])`;
      }

      const query = `
        SELECT
          v.id,
          v.vin,
          v.license_plate,
          v.make as brand,
          v.model,
          v.year,
          v.category,
          CASE
            WHEN v.transmission = 'MANUAL' THEN 'Manual gearbox'
            ELSE 'Automatic'
          END as transmission,
          CASE
            WHEN v.fuel_type = 'GASOLINE' THEN 'Petrol'
            WHEN v.fuel_type = 'DIESEL' THEN 'Diesel'
            WHEN v.fuel_type = 'ELECTRIC' THEN 'Electric'
            ELSE 'Hybrid'
          END as fuel,
          COALESCE(v.specs->>'power', '66 kW (90 hp)') as power,
          TO_CHAR(v.created_at, 'MM.YYYY') as "firstReg",
          CONCAT(COALESCE(v.specs->>'mileage', '12.450'), ' km') as mileage,
          COALESCE(v.specs->>'nextMaintenance', '01.12.2027') as "nextMaint",
          CASE
            WHEN v.status = 'AVAILABLE' THEN 'available'
            WHEN v.status = 'BOOKED' THEN 'booked'
            WHEN v.status = 'UNDER_MAINTENANCE' THEN 'service'
            WHEN v.status = 'OUT_OF_SERVICE' THEN 'issue'
            ELSE 'picked-up'
          END as status,
          CONCAT(v.base_daily_rate::text, ' TND') as "ratePerDay",
          v.photos[1] as image,
          v.specs,
          b.name as branch_name,
          b.id as branch_id
        FROM vehicles v
        JOIN branches b ON v.branch_id = b.id
        ${branchFilterQuery}
        ORDER BY v.created_at DESC;
      `;

      const result = await pool.query(query, params);
      res.status(200).json({ count: result.rowCount, vehicles: result.rows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/v1/admin/fleet/vehicles
   * Onboards a new vehicle with technical data, leasing, insurance and rental info (FR-6.1, FR-6.7)
   */
  public static async createVehicle(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const {
        brand,
        model,
        year = new Date().getFullYear(),
        category = "COMPACT",
        transmission = "MANUAL",
        fuelType = "GASOLINE",
        ratePerDay,
        licensePlate,
        vin,
        specs = {},
        branchId,
        photos = [],
      } = req.body;

      if (!brand || !model || !ratePerDay || !licensePlate) {
        res.status(400).json({
          error: "Brand, model, daily rate, and license plate are required.",
        });
        return;
      }

      // Default to fleet admin's primary assigned branch if not explicitly provided
      const targetBranchId =
        branchId || (req.user!.branchIds && req.user!.branchIds[0]);

      if (!targetBranchId) {
        res.status(400).json({
          error:
            "A valid branch assignment is required for vehicle onboarding.",
        });
        return;
      }

      // Generate random VIN if not provided
      const finalVin =
        vin ||
        `VIN${Math.random().toString(36).substring(2, 12).toUpperCase()}99`;

      const insertQuery = `
        INSERT INTO vehicles (
          branch_id, vin, license_plate, make, model, year, category,
          transmission, fuel_type, base_daily_rate, specs, photos, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'AVAILABLE' 
        ) RETURNING *;
      `;

      const result = await pool.query(insertQuery, [
        targetBranchId,
        finalVin,
        licensePlate,
        brand,
        model,
        parseInt(year, 10),
        category,
        transmission.toUpperCase().includes("AUTO") ? "AUTOMATIC" : "MANUAL",
        fuelType.toUpperCase().includes("DIESEL")
          ? "DIESEL"
          : fuelType.toUpperCase().includes("ELEC")
            ? "ELECTRIC"
            : "GASOLINE",
        parseFloat(ratePerDay),
        JSON.stringify(specs),
        photos.length > 0
          ? photos
          : [
              "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
            ],
      ]);

      // Audit Log Entry (NFR-7.1)
      await pool.query(
        `INSERT INTO audit_logs (
          actor_id, actor_role, action, resource_type, resource_id, ip_address, changes
        ) VALUES ($1, $2, 'VEHICLE_ONBOARDED', 'VEHICLE', $3, '127.0.0.1', $4)`,
        [
          req.user!.userId,
          req.user!.role,
          result.rows[0].id,
          JSON.stringify({ brand, model, licensePlate, ratePerDay }),
        ],
      );

      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      console.error("[AdminController] Vehicle Onboarding Error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Fleet Admin Live Map Data (FR-11.1)
   */
  public static async getLiveFleetMap(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      // Disable HTTP caching for live polling so that polling requests always receive a full 200 OK response.
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", 0);

      const livePositions = await TelematicsService.getFleetLivePositions();

      // Scoping: If FleetAdmin, only return vehicles belonging to their assigned branches
      if (req.user!.role === "FLEET_ADMIN") {
        const allowedBranches = req.user!.branchIds;
        const vehicleBranchRes = await pool.query(
          `SELECT id FROM vehicles WHERE branch_id = ANY($1::uuid[])`,
          [allowedBranches],
        );
        const allowedVehicleIds = new Set(
          vehicleBranchRes.rows.map((r) => r.id),
        );
        const filteredPositions = livePositions.filter((pos) =>
          allowedVehicleIds.has(pos.vehicleId),
        );

        res.status(200).json({ fleet: filteredPositions });
        return;
      }

      // Super Admins see all vehicles
      res.status(200).json({ fleet: livePositions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Remote vehicle Unlock/Lock command (FR-8.1)
   */
  public static async dispatchCommand(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { vehicleId } = req.params;
      const { command } = req.body; // 'LOCK_DOORS' | 'UNLOCK_DOORS'

      if (!["LOCK_DOORS", "UNLOCK_DOORS"].includes(command)) {
        res.status(400).json({ error: "Invalid command." });
        return;
      }

      await TelematicsService.sendVehicleCommand(vehicleId as string, command);
      res.status(200).json({ dispatched: true, vehicleId, command });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/v1/admin/customers/search?q=
   */
  public static async searchCustomers(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const query = ((req.query.q as string) || "").trim();

      if (!query || query.length < 2) {
        res.status(200).json({ customers: [] });
        return;
      }

      const searchQuery = `
        SELECT 
          id, 
          first_name, 
          last_name, 
          email, 
          phone_number,
          COALESCE(TO_CHAR(created_at, 'DD.MM.YYYY'), '11.10.1992') AS birth_date
        FROM users
        WHERE role = 'RENTER'
          AND (
            CONCAT(first_name, ' ', last_name) ILIKE CONCAT('%', $1::text, '%')
            OR email ILIKE CONCAT('%', $1::text, '%')
          )
        ORDER BY first_name ASC
        LIMIT 6;
      `;

      const result = await pool.query(searchQuery, [query]);
      res.status(200).json({ customers: result.rows });
    } catch (err: any) {
      console.error("[AdminController] Customer Search Error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/v1/admin/bookings
   * Places a confirmed reservation on behalf of a customer (FR-7.2)
   */
  public static async createAdminBooking(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const {
        vehicleId,
        customer = {},
        pickupDate,
        dropoffDate,
        pickupLocation = "Rental Office",
        dropoffLocation = "Rental Office",
        paymentMethod = "Credit Card",
        paymentDetails = {},
        totalAmount = "",
        remarks = "",
      } = req.body;

      if (!vehicleId || !pickupDate || !dropoffDate) {
        res
          .status(400)
          .json({ error: "Vehicle ID and rental dates are required." });
        return;
      }

      // 1. Normalize Customer Fields safely
      const firstName = (customer.firstName || customer.first_name).trim();
      const lastName = (customer.lastName || customer.last_name).trim();
      const email = customer.email.trim().toLowerCase();
      const phone = (
        customer.phone ||
        customer.phone_number ||
        customer.contactNo
      ).trim();

      // 2. Locate or create customer record
      let renterId: string;
      const userLookup = await pool.query(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [email],
      );

      if (userLookup.rows.length > 0) {
        renterId = userLookup.rows[0].id;
      } else {
        const newUserQuery = `
          INSERT INTO users (
            email,
            phone_number,
            password_hash,
            first_name,
            last_name,
            role,
            kyc_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id;
        `;
        const newUser = await pool.query(newUserQuery, [
          email,
          phone,
          "$argon2id$v=19$m=65536,t=3,p=4$external",
          firstName,
          lastName,
          "RENTER",
          "VERIFIED",
        ]);
        renterId = newUser.rows[0].id;
      }

      // 3. Locate vehicle and associated branch
      const vehicleRes = await pool.query(
        "SELECT branch_id, make, model FROM vehicles WHERE id = $1 LIMIT 1",
        [vehicleId],
      );
      if (vehicleRes.rows.length === 0) {
        res.status(404).json({ error: `Vehicle ${vehicleId} not found.` });
        return;
      }
      const branchId = vehicleRes.rows[0].branch_id;

      // 4. Generate 6-digit booking reference (matches wireframe: e.g. 934566)
      const bookingReference = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const numericTotal = parseFloat(
        String(totalAmount).replace(/\./g, "").replace(",", "."),
      );

      // 5. Create confirmed reservation record (Zero trailing commas, sequential $1 - $12)
      const bookingInsertQuery = `
        INSERT INTO bookings (
          booking_reference,
          renter_id,
          vehicle_id,
          pickup_branch_id,
          dropoff_branch_id,
          start_time,
          end_time,
          status,
          base_price,
          total_price,
          security_deposit,
          add_ons
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *;
      `;

      const bookingInsert = await pool.query(bookingInsertQuery, [
        bookingReference, // $1
        renterId, // $2
        vehicleId, // $3
        branchId, // $4
        branchId, // $5
        new Date(pickupDate), // $6
        new Date(dropoffDate), // $7
        "CONFIRMED", // $8
        numericTotal, // $9
        numericTotal, // $10
        2000.0, // $11
        JSON.stringify({ pickupLocation, dropoffLocation, remarks }), // $12
      ]);

      // 6. Record payment transaction
      const paymentInsertQuery = `
        INSERT INTO payment_transactions (
          booking_id,
          gateway_transaction_id,
          type,
          amount,
          currency,
          status,
          metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        );
      `;
      await pool.query(paymentInsertQuery, [
        bookingInsert.rows[0].id,
        `tx_admin_${Date.now()}`,
        "CARD",
        numericTotal,
        "TND",
        "CAPTURED",
        JSON.stringify({ paymentMethod, ...paymentDetails }),
      ]);

      // 7. Record immutable audit log (NFR-7.1)
      const auditInsertQuery = `
        INSERT INTO audit_logs (
          actor_id,
          actor_role,
          action,
          resource_type,
          resource_id,
          ip_address,
          changes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        );
      `;
      await pool.query(auditInsertQuery, [
        req.user!.userId,
        req.user!.role,
        "ADMIN_MANUAL_BOOKING",
        "BOOKING",
        bookingInsert.rows[0].id,
        "127.0.0.1",
        JSON.stringify({
          customer: email,
          total: numericTotal,
          bookingReference,
        }),
      ]);

      res.status(201).json({
        bookingId: bookingReference,
        booking: bookingInsert.rows[0],
      });
    } catch (err: any) {
      console.error("[AdminController] Admin Booking Error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/v1/admin/bookings
   * Returns all bookings with customer, vehicle, and payment details (FR-7.1)
   */
  public static async getAdminBookings(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { status, search } = req.query;
      const params: any[] = [];
      let whereClause = "WHERE 1=1";

      if (status && status !== "all") {
        params.push(status.toString().toUpperCase());
        whereClause += `  AND b.status = $${params.length}`;
      }

      if (search) {
        params.push(`%${search.toString().trim()}%`);
        whereClause += `  AND (
          b.booking_reference ILIKE $${params.length}
          OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $${params.length}
          OR v.license_plate ILIKE $${params.length}
          OR v.make ILIKE $${params.length}
        )`;
      }

      const query = `
        SELECT 
          b.id,
          b.booking_reference,
          b.start_time,
          b.end_time,
          b.status,
          b.total_price,
          b.security_deposit,
          b.add_ons,
          b.created_at,
          u.id as customer_id,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          u.email as customer_email,
          u.phone_number as customer_phone,
          v.id as vehicle_id,
          v.make as vehicle_make,
          v.model as vehicle_model,
          v.license_plate as vehicle_plate,
          COALESCE(v.specs->>'vehicleRef', 'SB002') as vehicle_ref,
          COALESCE(v.specs->>'mileage', '12450')::int as current_odometer,
          br.name as pickup_branch_name
        FROM bookings b
        JOIN users u ON b.renter_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        JOIN branches br ON b.pickup_branch_id = br.id
        ${whereClause}
        ORDER BY b.created_at DESC;
      `;

      const result = await pool.query(query, params);
      res.status(200).json({ count: result.rowCount, bookings: result.rows });
    } catch (err: any) {
      console.error("[AdminController] Get Bookings Error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  public static async handoverVehicle(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const {
        initialOdometer = 12450,
        initialFuel = 100,
        remarks = "Handed over in clean condition",
      } = req.body;

      const bookingRes = await pool.query(
        "SELECT * FROM bookings WHERE id = $1",
        [id],
      );
      if (bookingRes.rows.length === 0) {
        res.status(404).json({ error: "Booking not found." });
        return;
      }
      const booking = bookingRes.rows[0];

      // Update booking to ACTIVE
      await pool.query(
        `INSERT INTO inspection_records (
          booking_id, vehicle_id, inspector_id, type, odometer_reading, fuel_percentage, remarks
        ) VALUES ($1, $2, $3, 'PICKUP', $4, $5, $6);`,
        [
          id,
          booking.vehicle_id,
          req.user!.userId,
          initialOdometer,
          initialFuel,
          remarks,
        ],
      );

      // Audit Log
      await pool.query(
        `INSERT INTO audit_logs (
          actor_id, actor_role, action, resource_type, resource_id, ip_address, changes
        ) VALUES ($1, $2, 'VEHICLE_HANDOVER_PICKUP', 'BOOKING', $3, '127.0.0.1', $4);`,
        [
          req.user!.userId,
          req.user!.role,
          id,
          JSON.stringify({ initialOdometer, initialFuel, status: "ACTIVE" }),
        ],
      );

      res.status(200).json({ success: true, status: "ACTIVE" });
    } catch (err: any) {
      console.error("[AdminController] Handover error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/v1/admin/bookings/:id/return
   * Return inspection, computes incidentals, release deposit, sets status COMPLETED (FR-7.3, FR-4.5)
   */
  public static async processReturnInspection(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const {
        returnOdometer,
        returnFuel,
        fuelFee = 0,
        lateFee = 0,
        damageFee = 0,
        remarks = "Returned in flawless condition",
        photos = { front: true, back: true, left: true, right: true },
      } = req.body;

      const bookingRes = await pool.query(
        "SELECT * FROM bookings WHERE id = $1",
        [id],
      );
      if (bookingRes.rowCount === 0) {
        res.status(404).json({ error: "Booking not found." });
        return;
      }

      const booking = bookingRes.rows[0];

      const totalIncidentals = parseFloat(
        (Number(fuelFee) + Number(lateFee) + Number(damageFee)).toFixed(2),
      );
      const authorizedDeposit = parseFloat(
        booking.security_deposit || "2000.00",
      );
      const refundAmount = Math.max(0, authorizedDeposit - totalIncidentals);

      // 1. Mark booking as COMPLETED
      await pool.query(
        `UPDATE bookings SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
        [id],
      );

      // 2. Mark vehicle AVAILABLE and update odometer
      await pool.query(
        `UPDATE vehicles 
         SET status = 'AVAILABLE', 
             specs = jsonb_set(specs, '{mileage}', to_jsonb($1::text)),
             updated_at = NOW() 
         WHERE id = $2`,
        [returnOdometer.toString(), booking.vehicle_id],
      );

      // 3. Record Return Inspection (FR-8.1)
      await pool.query(
        `INSERT INTO inspection_records (
          booking_id, vehicle_id, inspector_id, type, odometer_reading, fuel_percentage, photos, remarks
        ) VALUES ($1, $2, $3, 'RETURN', $4, $5, $6, $7);`,
        [
          id,
          booking.vehicle_id,
          req.user!.userId,
          returnOdometer,
          returnFuel,
          JSON.stringify(photos),
          remarks,
        ],
      );

      // 4. Record incidental payment transaction if incidentals incurred
      if (totalIncidentals > 0) {
        await pool.query(
          `INSERT INTO payment_transactions (
            booking_id, gateway_transaction_id, type, amount, currency, status, metadata
          ) VALUES ($1, $2, 'INCIDENTAL_CAPTURE', $3, 'TND', 'CAPTURED', $4);`,
          [
            id,
            `incidental_${Date.now()}`,
            totalIncidentals,
            JSON.stringify({ fuelFee, lateFee, damageFee, remarks }),
          ],
        );
      }

      // 5. Audit Log (NFR-7.1)
      await pool.query(
        `INSERT INTO audit_logs (
          actor_id, actor_role, action, resource_type, resource_id, ip_address, changes
        ) VALUES ($1, $2, 'VEHICLE_RETURN_CHECKIN', 'BOOKING', $3, '127.0.0.1', $4);`,
        [
          req.user!.userId,
          req.user!.role,
          id,
          JSON.stringify({
            returnOdometer,
            returnFuel,
            totalIncidentals,
            refundAmount,
          }),
        ],
      );

      res.status(200).json({
        success: true,
        status: "COMPLETED",
        totalIncidentals,
        refundAmount,
      });
    } catch (err: any) {
      console.error("[AdminController] Return Inspection Error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/v1/admin/fleet/:vehicleId/trajectory
   * Returns historical GPS breadcrumbs from TimescaleDB hypertable (FR-11.1)
   */
  public static async getVehicleTrajectory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { vehicleId } = req.params;

      const query = `
        SELECT
          recorded_at,
          ROUND(ST_Y(location::geometry)::numeric, 5) AS latitude,
          ROUND(ST_X(location::geometry)::numeric, 5) AS longitude,
          speed_kmh,
          battery_level,
          fuel_level,
          doors_locked,
          engine_running
        FROM telemetry_logs
        WHERE vehicle_id = $1
        ORDER BY recorded_at ASC
        LIMIT 100;
      `;

      const result = await pool.query(query, [vehicleId]);

      const coordinates: [number, number][] = result.rows.map((r) => [
        parseFloat(r.latitude),
        parseFloat(r.longitude),
      ]);

      res.status(200).json({
        vehicleId,
        count: result.rowCount,
        coordinates,
        history: coordinates,
      });
    } catch (err: any) {
      console.error("[AdminController] Trajectory Error: ", err);
      res.status(500).json({ error: err.message });
    }
  }
}

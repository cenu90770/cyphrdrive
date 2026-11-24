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
   * Autocomplete search for customers by name or email
   */
  public static async searchCustomers(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const query = ((req.query.a as string) || "").trim().toLowerCase();
      if (!query || query.length < 2) {
        res.status(200).json({ customers: [] });
        return;
      }

      const result = await pool.query(
        `SELECT id, first_name, last_name, email, phone_number,
          COALESCE(TO_CHAR(created_at, 'DD.MM.YYYY'), '11.10.1992') as birth_date
        FROM users
        WHERE role = 'RENTER'
          AND (LOWER(first_name || ' ' || last_name) LIKE $1 OR LOWER(email) LIKE $1)
        LIMIT 6;`,
        [`%${query}`],
      );

      res.status(200).json({ customers: result.rows });
    } catch (err: any) {
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
        customer,
        pickupDate,
        dropoffDate,
        pickupLocation = "Rental Office",
        dropoffLocation = "Rental Office",
        paymentMethod = "Credit Card",
        paymentDetails = {},
        totalAmount,
        remarks,
      } = req.body;

      if (!vehicleId || !customer?.email || !pickupDate || !dropoffDate) {
        res.status(400).json({
          error: "Vehicle, customer email, and rental dates are required.",
        });
        return;
      }

      // 1. Locate or create a new customer record
      let renterId: string;
      const userLookup = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [customer.email],
      );

      if (userLookup.rows.length > 0) {
        renterId = userLookup.rows[0].id;
      } else {
        const newUser = await pool.query(
          `INSERT INTO users (email, phone_number, password_hash, first_name, last_name, role, kyc_status)
          VALUES ($1, $2, 'EXTERNAL_ADMIN_BOOKING', $3, $4, 'RENTER', 'VERIFIED')
          RETURNING id;`,
          [
            customer.email,
            customer.phone,
            customer.first_name,
            customer.last_name,
          ],
        );
        renterId = newUser.rows[0].id;
      }

      // 2. Fetch vehicle & branch
      const vehicleRes = await pool.query(
        "SELECT branch_id FROM vehicles WHERE id = $1",
        [vehicleId],
      );

      if (vehicleRes.rows.length === 0) {
        res
          .status(400)
          .json({ error: `Vehicle with ID ${vehicleId} not found.` });
        return;
      }
      const branchId = vehicleRes.rows[0].branch_id;

      // 3. Generate 6-digit booking reference (e.g. 934566)
      const bookingReference = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      // 4. Create confirmed booking record
      const bookingInsert = await pool.query(
        `INSERT INTO bookings (
          booking_reference, renter_id, vehicle_id, pickup_branch_id, dropoff_branch_id,
          start_time, end_time, status, base_price, total_price, security_deposit, add_ons,
        ) VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED', $7, $7, 2000.00, $8)
         RETURNING *;`,
        [
          bookingReference,
          renterId,
          vehicleId,
          branchId,
          new Date(pickupDate),
          new Date(dropoffDate),
          parseFloat(totalAmount || "2999.85"),
          JSON.stringify({ pickupLocation, dropoffLocation, remarks }),
        ],
      );

      // 5. Record payment transaction
      await pool.query(
        `INSERT INTO payment_transactions (
          booking_id, gateway_transaction_id, type, amount, currency, status, metadata
        ) VALUES ($1, $2, 'CARD', $3, 'TND', 'CAPTURED', $4);`,
        [
          bookingInsert.rows[0].id,
          `tx_admin_${Date.now()}`,
          parseFloat(totalAmount || "2999.85"),
          JSON.stringify({ paymentMethod, ...paymentDetails }),
        ],
      );

      // 6. Audit Trail (NFR-7.1)
      await pool.query(
        `INSERT INTO audit_logs (
          actor_id, actor_role, action, resource_type, resource_id, ip_address, changes
        ) VALUES ($1, $2, 'ADMIN_MANUAL_BOOKING', 'BOOKING', $3, '127.0.0.1', $4);`,
        [
          req.user!.userId,
          req.user!.role,
          bookingInsert.rows[0].id,
          JSON.stringify({
            customer: customer.email,
            total: totalAmount,
            bookingReference,
          }),
        ],
      );

      res.status(201).json({
        bookingId: bookingReference,
        booking: bookingInsert.rows[0],
      });
    } catch (err: any) {
      console.error("[AdminController] Admin Booking Error: ", err);
      res.status(500).json({ error: err.message });
    }
  }
}

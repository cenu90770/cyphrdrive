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
}

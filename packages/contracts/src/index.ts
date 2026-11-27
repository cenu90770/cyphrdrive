import { z } from "zod";

// ============================================================================
// 1. USER & AUTH CONTRACTS
// ============================================================================
export const UserRoleEnum = z.enum(["RENTER", "FLEET_ADMIN", "SUPER_ADMIN"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export interface AuthenticatedUserClaims {
  userId: string;
  email: string;
  role: UserRole;
  branchIds: string[];
}

// ============================================================================
// 2. CAR FLEET CONTRACTS
// ============================================================================
export type VehicleStatus =
  | "available"
  | "picked-up"
  | "booked"
  | "service"
  | "issue";

export interface FleetVehicle {
  id: string;
  displayId?: string;
  ref: string;
  brand: string;
  model: string;
  transmission: "Manual gearbox" | "Automatic";
  fuel: "Petrol" | "Diesel";
  power: string;
  firstReg: string;
  mileage: string;
  nextMaint: string;
  status: VehicleStatus;
  ratePerDay: string;
  image?: string;
  licensePlate?: string;
  specs?: any;
  leasing?: any;
  insurance?: any;
}

// ============================================================================
// 3. BOOKING & PRICING CONTRACTS (FR-3)
// ============================================================================
export const AddOnTypeEnum = z.enum([
  "GPS_NAVIGATION",
  "CHILD_SEAT",
  "ADDITIONAL_DRIVER",
  "INSURANCE_PREMIUM",
  "INSURANCE_ZERO_DEDUCTIBLE",
]);
export type AddOnType = z.infer<typeof AddOnTypeEnum>;

export const InitiateBookingSchema = z.object({
  renterId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  pickupBranchId: z.string().uuid(),
  dropoffBranchId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  addOns: z.array(AddOnTypeEnum).default([]),
});
export type InitiateBookingInput = z.infer<typeof InitiateBookingSchema>;

export interface BookingRecord {
  id: string;
  booking_reference: string;
  renter_id: string;
  vehicle_id: string;
  pickup_branch_id: string;
  dropoff_branch_id: string;
  start_time: string;
  end_time: string;
  status: "HOLD_PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  total_price: string;
  security_deposit: string;
  hold_expires_at: string | null;
}

// ============================================================================
// 4. TELEMATICS & IOT CONTRACTS (FR-11)
// ============================================================================
export interface VehicleLiveState {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  batteryLevel?: number;
  fuelLevel?: number;
  doorsLocked: boolean;
  engineRunning: boolean;
  odometer: number;
  dtcAlerts: string[];
  lastUpdated: string;
}

export const CRITICAL_DTC_MAP: Record<string, string> = {
  P0300: "Random/Multiple Cylinder Misfire Detected (Engine risk)",
  P0117: "Engine Coolant Temperature Circuit Low (Overheating risk)",
  P0700: "Transmission Control System Malfunction",
  B0001: "Driver Airbag Circuit / Safety Restraint Failure",
  P0562: "System Voltage Low (Main Battery Discharge)",
};

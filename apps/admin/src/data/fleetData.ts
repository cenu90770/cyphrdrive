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
  specs?: {
    seats: number;
    largeBags: number;
    smallBags: number;
  };
  leasing?: {
    provider: string;
    contractRef: string;
    start: string;
    end: string;
    type: string;
    downPayment: string;
    monthlyCharge: string;
    amount: string;
  };
  insurance?: {
    provider: string;
    contractRef: string;
    start: string;
    end: string;
    type: string;
    damageCoverage: string;
    monthlyCharge: string;
  };
}

export const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: "934566",
    ref: "SB002",
    brand: "Suzuki",
    model: "Baleno",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "01.2024",
    mileage: "64.204 km",
    nextMaint: "01.12.2027",
    status: "picked-up",
    ratePerDay: "199,99 TND",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
    licensePlate: "256 تونس 8331",
    specs: { seats: 5, largeBags: 1, smallBags: 1 },
    leasing: {
      provider: "Tunisie Leasing SA",
      contractRef: "LS8776A",
      start: "04.03.2026",
      end: "04.03.2029",
      type: "Full amortisation",
      downPayment: "17.360,00 TND (20%)",
      monthlyCharge: "1.928,88 TND",
      amount: "86.800,00 TND",
    },
    insurance: {
      provider: "Tunisie Assurance SA",
      contractRef: "TAL5680776",
      start: "04.03.2026",
      end: "-",
      type: "Liability coverage",
      damageCoverage: "10.000.000 TND",
      monthlyCharge: "928,00 TND",
    },
  },
  {
    id: "953204",
    ref: "VR005",
    brand: "Velocita",
    model: "R3",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "01.2025",
    mileage: "30.443 km",
    nextMaint: "01.12.2027",
    status: "picked-up",
    ratePerDay: "89,99 TND",
  },
  {
    id: "166889",
    ref: "TZ002",
    brand: "Thunderbolt",
    model: "ZX",
    transmission: "Automatic",
    fuel: "Diesel",
    power: "87 kW (118 hp)",
    firstReg: "04.2026",
    mileage: "204 km",
    nextMaint: "01.12.2027",
    status: "booked",
    ratePerDay: "149,99 TND",
  },
  {
    id: "333271",
    ref: "SS022",
    brand: "Solar",
    model: "Surge",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "05.2026",
    mileage: "14 km",
    nextMaint: "01.12.2027",
    status: "picked-up",
    ratePerDay: "119,99 TND",
  },
  {
    id: "455326",
    ref: "BR001",
    brand: "Blade",
    model: "Runner",
    transmission: "Manual gearbox",
    fuel: "Diesel",
    power: "87 kW (118 hp)",
    firstReg: "01.2026",
    mileage: "23 km",
    nextMaint: "01.12.2027",
    status: "picked-up",
    ratePerDay: "159,99 TND",
  },
  {
    id: "848546",
    ref: "NX143",
    brand: "Nighthawk",
    model: "XT3",
    transmission: "Automatic",
    fuel: "Diesel",
    power: "87 kW (118 hp)",
    firstReg: "01.2026",
    mileage: "56 km",
    nextMaint: "01.12.2027",
    status: "booked",
    ratePerDay: "179,99 TND",
  },
  {
    id: "753457",
    ref: "SB006",
    brand: "Suzuki",
    model: "Baleno",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "06.2026",
    mileage: "24 km",
    nextMaint: "01.12.2027",
    status: "available",
    ratePerDay: "199,99 TND",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "528585",
    ref: "ES112",
    brand: "Emline",
    model: "Strider",
    transmission: "Automatic",
    fuel: "Petrol",
    power: "96 kW (131 hp)",
    firstReg: "02.2026",
    mileage: "112 km",
    nextMaint: "01.12.2027",
    status: "service",
    ratePerDay: "129,99 TND",
  },
  {
    id: "550966",
    ref: "KP001",
    brand: "Kia",
    model: "Picanto",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "06.2026",
    mileage: "332 km",
    nextMaint: "01.12.2027",
    status: "available",
    ratePerDay: "89,99 TND",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "247653",
    ref: "KP002",
    brand: "Kia",
    model: "Picanto",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "06.2026",
    mileage: "45 km",
    nextMaint: "01.12.2027",
    status: "available",
    ratePerDay: "89,99 TND",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  },
];

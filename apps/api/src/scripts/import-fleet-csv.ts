import { pool } from "../config/db";

interface CsvRow {
  id: string;
  ref: string;
  brand: string;
  model: string;
  transmission: string;
  fuel: string;
  power: string;
  firstReg: string;
  mileage: string;
  nextMaint: string;
  status: string;
  baySlot: string;
  price: string;
  licensePlate: string;
}

const CSV_DATA: CsvRow[] = [
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
    baySlot: "001",
    price: "199,99 TND/day",
    licensePlate: "214 TUN 4502",
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
    baySlot: "002",
    price: "149,00 TND/day",
    licensePlate: "218 TUN 1289",
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
    baySlot: "003",
    price: "220,00 TND/day",
    licensePlate: "224 TUN 8891",
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
    baySlot: "004",
    price: "115,00 TND/day",
    licensePlate: "225 TUN 3327",
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
    baySlot: "005",
    price: "160,00 TND/day",
    licensePlate: "223 TUN 5326",
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
    baySlot: "006",
    price: "240,00 TND/day",
    licensePlate: "222 TUN 8546",
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
    status: "booked",
    baySlot: "007",
    price: "199,99 TND/day",
    licensePlate: "226 TUN 3457",
  },
  {
    id: "934568",
    ref: "BR002",
    brand: "Blade",
    model: "Runner",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "06.2026",
    mileage: "26 km",
    nextMaint: "01.12.2027",
    status: "booked",
    baySlot: "008",
    price: "155,00 TND/day",
    licensePlate: "226 TUN 4568",
  },
  {
    id: "238364",
    ref: "SB050",
    brand: "Suzuki",
    model: "Baleno",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "06.2026",
    mileage: "103 km",
    nextMaint: "01.12.2027",
    status: "picked-up",
    baySlot: "009",
    price: "199,99 TND/day",
    licensePlate: "226 TUN 8364",
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
    baySlot: "010",
    price: "180,00 TND/day",
    licensePlate: "223 TUN 8585",
  },
  {
    id: "557735",
    ref: "VH007",
    brand: "Vortex",
    model: "Helios",
    transmission: "Automatic",
    fuel: "Petrol",
    power: "96 kW (131 hp)",
    firstReg: "02.2026",
    mileage: "204 km",
    nextMaint: "01.12.2027",
    status: "picked-up",
    baySlot: "011",
    price: "210,00 TND/day",
    licensePlate: "223 TUN 7735",
  },
  {
    id: "319948",
    ref: "VH009",
    brand: "Vortex",
    model: "Helios",
    transmission: "Automatic",
    fuel: "Petrol",
    power: "96 kW (131 hp)",
    firstReg: "04.2024",
    mileage: "25 km",
    nextMaint: "01.12.2027",
    status: "booked",
    baySlot: "012",
    price: "210,00 TND/day",
    licensePlate: "216 TUN 9948",
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
    status: "booked",
    baySlot: "013",
    price: "89,99 TND/day",
    licensePlate: "226 TUN 0966",
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
    status: "booked",
    baySlot: "014",
    price: "89,99 TND/day",
    licensePlate: "226 TUN 7653",
  },
  {
    id: "612890",
    ref: "KP003",
    brand: "Kia",
    model: "Picanto",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "07.2026",
    mileage: "12 km",
    nextMaint: "01.12.2027",
    status: "available",
    baySlot: "004",
    price: "89,99 TND/day",
    licensePlate: "227 TUN 2890",
  },
  {
    id: "718293",
    ref: "SB012",
    brand: "Suzuki",
    model: "Baleno",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "05.2026",
    mileage: "88 km",
    nextMaint: "01.12.2027",
    status: "available",
    baySlot: "006",
    price: "199,99 TND/day",
    licensePlate: "225 TUN 8293",
  },
  {
    id: "829104",
    ref: "KP004",
    brand: "Kia",
    model: "Picanto",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "07.2026",
    mileage: "8 km",
    nextMaint: "01.12.2027",
    status: "available",
    baySlot: "007",
    price: "89,99 TND/day",
    licensePlate: "227 TUN 9104",
  },
  {
    id: "901283",
    ref: "MG001",
    brand: "MG",
    model: "ZS",
    transmission: "Automatic",
    fuel: "Petrol",
    power: "84 kW (114 hp)",
    firstReg: "03.2026",
    mileage: "190 km",
    nextMaint: "01.12.2027",
    status: "available",
    baySlot: "008",
    price: "139,99 TND/day",
    licensePlate: "224 TUN 1283",
  },
  {
    id: "449102",
    ref: "TZ008",
    brand: "Thunderbolt",
    model: "ZX",
    transmission: "Automatic",
    fuel: "Diesel",
    power: "87 kW (118 hp)",
    firstReg: "02.2025",
    mileage: "18.920 km",
    nextMaint: "15.08.2026",
    status: "issue",
    baySlot: "015",
    price: "220,00 TND/day",
    licensePlate: "219 TUN 9102",
  },
  {
    id: "503921",
    ref: "VR011",
    brand: "Velocita",
    model: "R3",
    transmission: "Manual gearbox",
    fuel: "Petrol",
    power: "66 kW (90 hp)",
    firstReg: "04.2025",
    mileage: "14.200 km",
    nextMaint: "01.12.2027",
    status: "service",
    baySlot: "016",
    price: "149,00 TND/day",
    licensePlate: "220 TUN 3921",
  },
];

// Curated car photo assets by model
const PHOTO_MAP: Record<string, string> = {
  Baleno:
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
  Picanto:
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  ZS: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
  Runner:
    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
  ZX: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  Helios:
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
  R3: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80",
  Surge:
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
  XT3: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
  Strider:
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80",
};

async function importFleet() {
  console.log(
    "================================================================",
  );
  console.log(
    "   IMPORTING FLEET POOL CSV (20 VEHICLES) INTO POSTGRESQL       ",
  );
  console.log(
    "================================================================\n",
  );

  // 1. Get primary branch
  const branchRes = await pool.query("SELECT id, name FROM branches LIMIT 1;");
  if (branchRes.rows.length === 0) {
    console.error("❌ No branch found in database!");
    process.exit(1);
  }
  const branchId = branchRes.rows[0].id;
  console.log(
    `📍 Assigning vehicles to branch: ${branchRes.rows[0].name} (${branchId})\n`,
  );

  let inserted = 0;

  for (const car of CSV_DATA) {
    // Clean numeric price (e.g. "199,99 TND/day" -> 199.99)
    const numericRate = parseFloat(car.price.split(" ")[0].replace(",", "."));

    // Parse Year from "01.2024" -> 2024
    const regParts = car.firstReg.split(".");
    const year = regParts.length > 1 ? parseInt(regParts[1], 10) : 2024;

    // Map database enum status: AVAILABLE, BOOKED, UNDER_MAINTENANCE, OUT_OF_SERVICE
    let dbStatus = "AVAILABLE";
    if (car.status === "booked" || car.status === "picked-up")
      dbStatus = "BOOKED";
    if (car.status === "service") dbStatus = "UNDER_MAINTENANCE";
    if (car.status === "issue") dbStatus = "OUT_OF_SERVICE";

    // Map transmission
    const transmission = car.transmission.toLowerCase().includes("auto")
      ? "AUTOMATIC"
      : "MANUAL";

    // Map fuel
    const fuelType = car.fuel.toLowerCase().includes("diesel")
      ? "DIESEL"
      : "GASOLINE";

    // Determine category
    const isSuv = ["ZX", "XT3", "ZS", "Strider"].includes(car.model);
    const category = isSuv ? "SUV" : "Compact";

    // Generate VIN
    // Standard 17-character VIN (ISO 3779): 'TN' (2) + id (6) + ref (5) + '2026' (4)
    const vin = `TN${car.id}${car.ref}2026`.padEnd(17, "0").slice(0, 17);

    // Vehicle photo
    const photo = PHOTO_MAP[car.model] || PHOTO_MAP.Baleno;

    // Tunisian Arabic Plate string (e.g. "214 TUN 4502" -> "214 تونس 4502")
    const plateArabic = car.licensePlate.replace("TUN", "تونس");

    const specs = {
      displayId: car.id,
      vehicleRef: car.ref,
      baySlot: car.baySlot,
      power: car.power,
      firstReg: car.firstReg,
      mileage: car.mileage,
      nextMaintenance: car.nextMaint,
      csvStatus: car.status,
      seats: isSuv ? 5 : 4,
      largeBags: isSuv ? 2 : 1,
      smallBags: 1,
      leasing: {
        provider: "Tunisie Leasing SA",
        contractRef: `LS-${car.id.slice(-4)}`,
        start: "01.01.2026",
        end: "01.01.2029",
        type: "Full amortisation",
        amount: "85.000,00 TND",
        downPayment: "17.000,00 TND (20%)",
        monthlyCharge: "1.850,00 TND",
      },
      insurance: {
        provider: "Tunisie Assurance SA",
        contractRef: `TAL-${car.id.slice(-4)}`,
        start: "01.01.2026",
        end: "-",
        type: "Liability coverage",
        damageCoverage: "10.000.000 TND",
        monthlyCharge: "850,00 TND",
      },
    };

    const query = `
      INSERT INTO vehicles (
        branch_id, vin, license_plate, make, model, year, category, 
        transmission, fuel_type, base_daily_rate, specs, photos, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      ON CONFLICT (license_plate) DO UPDATE SET
        make = EXCLUDED.make,
        model = EXCLUDED.model,
        base_daily_rate = EXCLUDED.base_daily_rate,
        specs = EXCLUDED.specs,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING id;
    `;

    await pool.query(query, [
      branchId,
      vin,
      plateArabic,
      car.brand,
      car.model,
      year,
      category,
      transmission,
      fuelType,
      numericRate,
      JSON.stringify(specs),
      [photo],
      dbStatus,
    ]);

    inserted++;
    console.log(
      `   [${inserted}/20] Imported ${car.brand} ${car.model} (${car.ref}) | Plate: ${plateArabic} | Bay: ${car.baySlot} | Status: ${car.status}`,
    );
  }

  console.log(
    `\n🎉 Successfully imported ${inserted} vehicles into PostgreSQL!`,
  );
  await pool.end();
}

importFleet().catch((err) => {
  console.error("Import error:", err);
  process.exit(1);
});

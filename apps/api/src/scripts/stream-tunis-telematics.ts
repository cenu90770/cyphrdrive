import mqtt from "mqtt";
import { pool } from "../config/db";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTunisStreamer() {
  console.log(
    "================================================================",
  );
  console.log(
    "   CYPHRDRIVE LIVE TELEMATICS SIMULATOR: LAC II -> BORJ LOUZIR  ",
  );
  console.log(
    "================================================================\n",
  );

  const vehicleRes = await pool.query(
    `SELECT id, make, model, license_plate FROM vehicles ORDER BY created_at ASC LIMIT 1;`,
  );

  if (vehicleRes.rows.length === 0) {
    console.error(
      "❌ No vehicles found in database! Please onboard a vehicle first.",
    );
    process.exit(1);
  }

  const vehicle = vehicleRes.rows[0];
  console.log(
    `🚗 Streaming for: ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`,
  );

  const client = mqtt.connect("mqtt://localhost:1883");

  await new Promise<void>((resolve) => {
    client.on("connect", () => {
      console.log("✅ Connected to EMQX MQTT Broker (Port 1883).");
      resolve();
    });
  });

  // Chronological Route: Depart from Lac II -> Arrive at Borj Louzir
  const waypoints = [
    {
      lat: 36.8375,
      lon: 10.245,
      speed: 0.0,
      battery: 100,
      fuel: 100,
      odo: 12450,
    }, // START: Lac II
    {
      lat: 36.842,
      lon: 10.258,
      speed: 35.0,
      battery: 99,
      fuel: 98,
      odo: 12452,
    }, // Ain Zaghouan
    {
      lat: 36.847,
      lon: 10.252,
      speed: 45.0,
      battery: 98,
      fuel: 96,
      odo: 12454,
    },
    {
      lat: 36.852,
      lon: 10.246,
      speed: 40.0,
      battery: 97,
      fuel: 94,
      odo: 12456,
    }, // El Aouina
    {
      lat: 36.858,
      lon: 10.241,
      speed: 50.0,
      battery: 95,
      fuel: 92,
      odo: 12458,
    },
    {
      lat: 36.864,
      lon: 10.235,
      speed: 58.0,
      battery: 94,
      fuel: 90,
      odo: 12460,
    }, // La Soukra
    {
      lat: 36.866,
      lon: 10.226,
      speed: 62.0,
      battery: 93,
      fuel: 88,
      odo: 12462,
    },
    {
      lat: 36.8685,
      lon: 10.215,
      speed: 45.0,
      battery: 92,
      fuel: 86,
      odo: 12464,
    }, // Chotrana
    {
      lat: 36.867,
      lon: 10.207,
      speed: 30.0,
      battery: 92,
      fuel: 85,
      odo: 12465,
    },
    {
      lat: 36.8655,
      lon: 10.198,
      speed: 16.0,
      battery: 92,
      fuel: 85,
      odo: 12467,
    }, // ARRIVAL: Borj Louzir
  ];

  console.log(
    `📡 Commencing trip from Lac II to Borj Louzir (${waypoints.length} packets)...`,
  );

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const payload = {
      vehicleId: vehicle.id,
      timestamp: new Date().toISOString(),
      latitude: wp.lat,
      longitude: wp.lon,
      speedKmh: wp.speed,
      batteryLevel: wp.battery,
      fuelLevel: wp.fuel,
      doorsLocked: wp.speed === 0,
      engineRunning: wp.speed > 0,
      odometer: wp.odo,
      diagnosticTroubleCodes: [],
    };

    const topic = `vehicles/${vehicle.id}/telemetry`;
    client.publish(topic, JSON.stringify(payload), { qos: 1 });

    console.log(
      `   [Point ${i + 1}/${waypoints.length}] Lat: ${wp.lat.toFixed(4)}, Lon: ${wp.lon.toFixed(4)} | Speed: ${wp.speed} km/h | Fuel: ${wp.fuel}%`,
    );

    await sleep(2500);
  }

  console.log("\n🏁 Arrived at final location: Borj Louzir.");
  client.end();
  await pool.end();
}

runTunisStreamer().catch(console.error);

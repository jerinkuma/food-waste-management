
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Restaurant = require("./models/Restaurant");
const Ngo = require("./models/Ngo");
const Donation = require("./models/Donation");

// ======================================================
// DATABASE CONNECTION
// ======================================================

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.CENTRAL_DB_URI ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error(
    "MongoDB URI not found. Check your server/.env file."
  );
  process.exit(1);
}

// ======================================================
// HISTORICAL DATA CONFIGURATION
// ======================================================

const FOOD_ITEMS = [
  { name: "Chicken Biryani", type: "Cooked Meal", category: "Non-Vegetarian" },
  { name: "Vegetable Khichuri", type: "Cooked Meal", category: "Vegetarian" },
  { name: "Rice and Chicken Curry", type: "Cooked Meal", category: "Non-Vegetarian" },
  { name: "Vegetable Fried Rice", type: "Cooked Meal", category: "Vegetarian" },
  { name: "Beef Curry with Rice", type: "Cooked Meal", category: "Non-Vegetarian" },
  { name: "Fresh Sandwich", type: "Bakery", category: "Vegetarian" },
  { name: "Paratha and Vegetable", type: "Cooked Meal", category: "Vegetarian" },
  { name: "Chicken Sandwich", type: "Bakery", category: "Non-Vegetarian" },
  { name: "Fresh Bread", type: "Bakery", category: "Vegetarian" },
  { name: "Seasonal Fruits", type: "Fresh Food", category: "Vegetarian" },
  { name: "Mixed Vegetable Curry", type: "Cooked Meal", category: "Vegetarian" },
  { name: "Fish Curry with Rice", type: "Cooked Meal", category: "Non-Vegetarian" },
];

const CONDITIONS = ["Fresh", "Hot", "Cold", "Packed"];

const LOGISTICS = [
  "FoodPanda Tracking",
  "By Self Option",
  "Third-party Delivery",
];

// Distribution of historical donation statuses.
// Completed records are intentionally the largest group.
const STATUS_PATTERN = [
  "Completed",
  "Completed",
  "Completed",
  "Completed",
  "Completed",
  "Accepted",
  "Accepted",
  "Pending",
  "Pending",
  "Rejected",
];

// ======================================================
// DETERMINISTIC HELPERS
// ======================================================

const getMonthlyCount = (year, month) => {
  // month: 1-12
  const seed = year * 13 + month * 7;

  if (year === 2025) {
    return 8 + (seed % 8); // 8-15
  }

  return 10 + (seed % 9); // 10-18
};

const getDate = (year, month, day, hour = 10, minute = 0) => {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0)
  );
};

const addHours = (date, hours) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

const selectItem = (items, index) => {
  return items[index % items.length];
};

const getStatus = (index, monthIndex) => {
  return STATUS_PATTERN[(index + monthIndex) % STATUS_PATTERN.length];
};

const getPhone = (restaurant) => {
  return restaurant.phone || "Not provided";
};

// ======================================================
// STATUS HISTORY HELPER
// ======================================================

const makeHistory = (status, changedAt, changedBy, note) => ({
  status,
  changedAt,
  changedBy,
  note,
});

// ======================================================
// BUILD DONATION DOCUMENT
// ======================================================

const buildDonation = ({
  donor,
  restaurant,
  ngo,
  year,
  month,
  sequence,
  status,
}) => {
  const createdAt = getDate(
    year,
    month,
    2 + ((sequence * 5 + month * 3) % 25),
    9 + ((sequence + month) % 10),
    (sequence * 7) % 60
  );

  const pickupDate = addHours(createdAt, 24);
  const bestBefore = addHours(pickupDate, 8);

  const item = selectItem(
    FOOD_ITEMS,
    year + month + sequence
  );

  const donationId =
    `FL-HIST-${year}-${String(month).padStart(2, "0")}-${String(sequence).padStart(2, "0")}`;

  const requestId =
    `REQ-HIST-${year}${String(month).padStart(2, "0")}-${String(sequence).padStart(2, "0")}`;

  const statusHistory = [
    makeHistory(
      "Pending",
      createdAt,
      donor._id,
      "Historical donation published by restaurant"
    ),
  ];

  let selectedNgo = null;
  let ngoRequests = [];
  let ngoRequest = {
    requested: false,
    requestedBy: null,
    requestedAt: null,
    acceptedAt: null,
  };

  let pipelineStatus = "Pending";
  let donationStatus = "Waiting for NGO Acceptance";
  let updatedAt = createdAt;

  let deliveryMan = {
    name: "",
    phone: "",
    vehicleNumber: "",
    assignedAt: null,
  };

  let verification = {
    scannedAt: null,
    checks: [],
    approved: false,
    verifiedAt: null,
    rejectionReason: "",
  };

  let ngoActionAt = addHours(createdAt, 3);

  // --------------------------------------------------
  // ACCEPTED
  // --------------------------------------------------

  if (status === "Accepted") {
    selectedNgo = ngo._id;
    pipelineStatus = "Accepted";
    donationStatus = "Delivery Man Assigned";

    ngoRequests = [
      {
        requestedBy: ngo._id,
        status: "Accepted",
        requestedAt: ngoActionAt,
        respondedAt: addHours(ngoActionAt, 1),
      },
    ];

    ngoRequest = {
      requested: true,
      requestedBy: ngo._id,
      requestedAt: ngoActionAt,
      acceptedAt: addHours(ngoActionAt, 1),
    };

    deliveryMan = {
      name: "Historical Delivery Volunteer",
      phone: getPhone(restaurant),
      vehicleNumber: "HIST-DELIVERY",
      assignedAt: addHours(ngoActionAt, 2),
    };

    statusHistory.push(
      makeHistory(
        "NGO Requested",
        ngoActionAt,
        ngo.user,
        "NGO requested the donation"
      ),
      makeHistory(
        "Delivery Man Assigned",
        deliveryMan.assignedAt,
        ngo.user,
        "Delivery volunteer assigned"
      )
    );

    updatedAt = deliveryMan.assignedAt;
  }

  // --------------------------------------------------
  // REJECTED
  // --------------------------------------------------

  if (status === "Rejected") {
    pipelineStatus = "Rejected";
    donationStatus = "Rejected";

    ngoRequests = [
      {
        requestedBy: ngo._id,
        status: "Rejected",
        requestedAt: ngoActionAt,
        respondedAt: addHours(ngoActionAt, 2),
      },
    ];

    ngoRequest = {
      requested: true,
      requestedBy: ngo._id,
      requestedAt: ngoActionAt,
      acceptedAt: null,
    };

    const rejectedAt = addHours(ngoActionAt, 2);

    statusHistory.push(
      makeHistory(
        "NGO Requested",
        ngoActionAt,
        ngo.user,
        "NGO reviewed the donation"
      ),
      makeHistory(
        "Rejected",
        rejectedAt,
        ngo.user,
        "Historical rejection record"
      )
    );

    updatedAt = rejectedAt;
  }

  // --------------------------------------------------
  // COMPLETED
  // --------------------------------------------------

  if (status === "Completed") {
    selectedNgo = ngo._id;
    pipelineStatus = "Completed";
    donationStatus = "Completed";

    const requestedAt = addHours(createdAt, 2);
    const acceptedAt = addHours(createdAt, 3);
    const assignedAt = addHours(createdAt, 4);
    const arrivingAt = addHours(createdAt, 5);
    const pickedUpAt = addHours(createdAt, 6);
    const deliveredAt = addHours(createdAt, 8);
    const completedAt = addHours(createdAt, 9);

    ngoRequests = [
      {
        requestedBy: ngo._id,
        status: "Accepted",
        requestedAt,
        respondedAt: acceptedAt,
      },
    ];

    ngoRequest = {
      requested: true,
      requestedBy: ngo._id,
      requestedAt,
      acceptedAt,
    };

    deliveryMan = {
      name: "Historical Delivery Volunteer",
      phone: getPhone(restaurant),
      vehicleNumber: "HIST-DELIVERY",
      assignedAt,
    };

    statusHistory.push(
      makeHistory(
        "NGO Requested",
        requestedAt,
        ngo.user,
        "NGO requested the donation"
      ),
      makeHistory(
        "Delivery Man Assigned",
        assignedAt,
        ngo.user,
        "Delivery volunteer assigned"
      ),
      makeHistory(
        "Driver Arriving",
        arrivingAt,
        ngo.user,
        "Driver arrived for pickup"
      ),
      makeHistory(
        "Food Picked Up",
        pickedUpAt,
        ngo.user,
        "Food collected from restaurant"
      ),
      makeHistory(
        "Delivered",
        deliveredAt,
        ngo.user,
        "Food delivered to NGO"
      ),
      makeHistory(
        "Completed",
        completedAt,
        ngo.user,
        "Food verification completed"
      )
    );

    verification = {
      scannedAt: pickedUpAt,
      checks: [true, true, true, true],
      approved: true,
      verifiedAt: completedAt,
      rejectionReason: "",
    };

    updatedAt = completedAt;
  }

  const latitude = restaurant.location?.latitude ?? null;
  const longitude = restaurant.location?.longitude ?? null;

  return {
    donor: donor._id,

    foodName: item.name,
    foodType: item.type,
    quantity: 10 + ((sequence * 7 + month) % 91),
    cookingTime: "10:30 AM",
    bestBefore,

    condition: selectItem(CONDITIONS, sequence + month),
    foodCategory: item.category,

    pickupAddress: restaurant.address,
    pickupDate,
    pickupTime: "11:00 AM - 01:00 PM",
    contactNumber: restaurant.phone,
    pickupDuration: "2 hours",

    specialInstructions: "Historical demonstration record",
    pickupLocation: {
      lat: latitude,
      lng: longitude,
    },

    // Use restaurant coordinates if available.
    // Otherwise, let the schema apply its default.
    ...(latitude !== null && longitude !== null
      ? { coords: [latitude, longitude] }
      : {}),

    safetyConfirmed: true,

    donationId,
    requestId,
    qrCode: "",

    logistics: selectItem(LOGISTICS, sequence + month),
    estimatedArrival: "15 mins",
    message: "Historical donation record",
    timeAgo: "Historical",

    status: donationStatus,
    pipelineStatus,
    statusHistory,

    ngoRequests,
    selectedNgo,
    ngoRequest,

    deliveryMan,

    verification,

    donationReason: "",
    ngoAcceptanceReason: "",

    createdAt,
    updatedAt,
  };
};

// ======================================================
// MAIN SEED FUNCTION
// ======================================================

const seedHistoricalData = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.");

    // --------------------------------------------------
    // LOAD EXISTING DONORS AND RESTAURANT PROFILES
    // --------------------------------------------------

    const donors = await User.find({
      role: "donor",
      isBlocked: { $ne: true },
    }).lean();

    const donorIds = donors.map((donor) => donor._id);

    const restaurants = await Restaurant.find({
      user: { $in: donorIds },
    }).lean();

    const restaurantByUser = new Map(
      restaurants.map((restaurant) => [
        String(restaurant.user),
        restaurant,
      ])
    );

    const validDonors = donors
      .filter((donor) => restaurantByUser.has(String(donor._id)))
      .map((donor) => ({
        donor,
        restaurant: restaurantByUser.get(String(donor._id)),
      }));

    // --------------------------------------------------
    // LOAD EXISTING NGO PROFILES
    // --------------------------------------------------

    const ngos = await Ngo.find()
      .populate("user", "_id name email role isBlocked")
      .lean();

    const validNgos = ngos.filter(
      (ngo) =>
        ngo.user &&
        ngo.user.role === "ngo" &&
        !ngo.user.isBlocked
    );

    if (validDonors.length === 0) {
      throw new Error(
        "No active donor with a Restaurant profile was found. Register a donor and complete its restaurant profile first."
      );
    }

    if (validNgos.length === 0) {
      throw new Error(
        "No active NGO profile was found. Register an NGO and complete its profile first."
      );
    }

    console.log(`Eligible donors: ${validDonors.length}`);
    console.log(`Eligible NGOs: ${validNgos.length}`);

    // --------------------------------------------------
    // LOAD EXISTING HISTORICAL IDs
    // --------------------------------------------------

    const existingDonations = await Donation.find({
      donationId: /^FL-HIST-/,
    })
      .select("donationId")
      .lean();

    const existingIds = new Set(
      existingDonations.map((item) => item.donationId)
    );

    let inserted = 0;
    let skipped = 0;

    const monthlySummary = [];

    // --------------------------------------------------
    // JANUARY 2025 - SEPTEMBER 2026
    // --------------------------------------------------

    for (let year = 2025; year <= 2026; year++) {
      const lastMonth = year === 2025 ? 12 : 9;

      for (let month = 1; month <= lastMonth; month++) {
        const count = getMonthlyCount(year, month);
        let monthInserted = 0;

        for (let sequence = 1; sequence <= count; sequence++) {
          const donationId =
            `FL-HIST-${year}-${String(month).padStart(2, "0")}-${String(sequence).padStart(2, "0")}`;

          // Idempotency: never insert the same seeded ID twice.
          if (existingIds.has(donationId)) {
            skipped++;
            continue;
          }

          const donorEntry = selectItem(
            validDonors,
            year + month + sequence
          );

          const ngo = selectItem(
            validNgos,
            year + month + sequence * 3
          );

          const status = getStatus(sequence, month);

          const donation = buildDonation({
            donor: donorEntry.donor,
            restaurant: donorEntry.restaurant,
            ngo,
            year,
            month,
            sequence,
            status,
          });

          await new Donation(donation).save({
            timestamps: false,
          });

          existingIds.add(donationId);
          inserted++;
          monthInserted++;
        }

        monthlySummary.push({
          month: `${year}-${String(month).padStart(2, "0")}`,
          requested: count,
          inserted: monthInserted,
        });
      }
    }

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    console.log("\n======================================");
    console.log("HISTORICAL SEED COMPLETED");
    console.log("======================================");
    console.log("New donations inserted:", inserted);
    console.log("Existing donations skipped:", skipped);
    console.log("Total historical seed IDs:", existingIds.size);

    console.table(monthlySummary);

    console.log(
      "\nExisting users, restaurants, NGOs and donations were not deleted."
    );

  } catch (error) {
    console.error("\nHistorical seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
};

seedHistoricalData();

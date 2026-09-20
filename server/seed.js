const mongoose = require('mongoose');
const Donor = require('./models/Donor');
const PendingFeedback = require('./models/PendingFeedback');

mongoose.connect('YOUR_MONGODB_URI_HERE');

const seedData = async () => {
  await Donor.deleteMany({});
  await PendingFeedback.deleteMany({});

  const createdDonors = await Donor.insertMany([
    {
      name: "Café 1",
      location: "Agrabad, Chattogram",
      trustScore: 4.8,
      totalDonations: 42,
      isFollowed: true,
      tags: ["Fresh Food", "Super Fast", "Top Rated"],
      recentImages: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200"],
      reviews: [{ user: "Volunteer A", rating: 5, comment: "Food was warm and well packed.", type: "positive" }]
    },
    {
      name: "Hotel Agrabad",
      location: "Agrabad, Chattogram",
      trustScore: 4.7,
      totalDonations: 35,
      isFollowed: false,
      tags: ["Large Meals", "Very Hygienic"],
      recentImages: [],
      reviews: [{ user: "Shelter Coordinator", rating: 5, comment: "Excellent quantity.", type: "positive" }]
    }
  ]);

  await PendingFeedback.insertMany([
    { orderId: "DH1005", donorId: createdDonors[0]._id, donorName: "Café 1", food: "Rice & Chicken Curry (~30 meals)", deliveredTime: "2 hours ago" }
  ]);

  console.log("Data Seeded Successfully!");
  process.exit();
};

seedData();
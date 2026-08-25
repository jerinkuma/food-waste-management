const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// সেন্ট্রাল ডাটাবেস কানেকশন
mongoose.connect(MONGO_URI)
.then(() => {
    console.log("Central Database Connected Successfully!");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error("Database connection failed:", err);
});
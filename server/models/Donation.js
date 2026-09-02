
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        foodName: {
            type: String,
            required: true,
            trim: true,
        },

        foodType: {
            type: String,
            required: true,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
        },

        estimatedMeals: {
            type: Number,
            required: true,
        },

        cookingTime: {
            type: String,
            required: true,
        },

        bestBefore: {
            type: Date,
            required: true,
        },

        condition: {
            type: String,
            enum: ["Fresh", "Hot", "Cold", "Packed"],
            required: true,
        },

        foodCategory: {
            type: String,
            enum: ["Vegetarian", "Non-Vegetarian"],
            required: true,
        },

        pickupAddress: {
            type: String,
            required: true,
            trim: true,
        },

        pickupDate: {
            type: Date,
            required: true,
        },

        pickupTime: {
            type: String,
            required: true,
        },

        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },

        pickupDuration: {
            type: String,
            required: true,
        },

        specialInstructions: {
            type: String,
            trim: true,
            default: "",
        },

        safetyConfirmed: {
            type: Boolean,
            required: true,
            default: false,
        },

        donationId: {
            type: String,
            unique: true,
            required: true,
        },


        status: {
            type: String,
            enum: [
                "Published",
                "Waiting for NGO Acceptance",
                "NGO Accepted",
                "Food Picked Up",
                "Delivered",
                "Completed",
                "Rejected",
            ],
            default: "Waiting for NGO Acceptance",
        },



        qrCode: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Donation", donationSchema);


const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
{
  storeName: {
    type: String,
    required: true,
    trim: true
  },

  ownerName: {
    type: String,
    trim: true
  },

  productName: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },

  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },

  address: {
    shopNumber: {
      type: String,
      trim: true
    },

    street: {
      type: String,
      trim: true
    },

    marketArea: {
      type: String,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      required: true,
      trim: true
    },

    pincode: {
      type: String,
      trim: true
    },

    country: {
      type: String,
      default: "India",
      trim: true
    }
  },

  fullAddress: {
    type: String,
    trim: true
  },

  latitude: {
    type: Number,
    required: true
  },

  longitude: {
    type: Number,
    required: true
  },

  phone: {
    type: String,
    trim: true
  },

  isOpen: {
    type: Boolean,
    default: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
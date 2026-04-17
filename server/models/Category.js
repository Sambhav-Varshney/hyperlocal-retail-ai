const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
{
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  icon: {
    type: String,
    trim: true
  },

  image: {
    type: String,
    trim: true
  },

  displayOrder: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
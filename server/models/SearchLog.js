const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  keyword: {
    type: String,
    required: true,
    trim: true
  },

  city: String,

  state: String,

  latitude: Number,

  longitude: Number,

  resultsFound: {
    type: Number,
    default: 0
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("SearchLog", searchLogSchema);
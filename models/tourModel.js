const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price9'],
  },
  duration: Number,
  difficulty: String,
  // createdAt: Date().toString(),
  images: [String],
  summary: String,
  description: String,
  startDates: [String],
  nextStartDate: String,
  maxGroupSize: Number,
  ratingsAverage: Number,
  atingsQuantity: Number,
  numReviews: Number,
  imageCover: String,
  createdAt: { type: Date, default: Date.now },
});

//Creating a Model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

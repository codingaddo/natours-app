const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    slug: String,
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
    images: [String],
    summary: String,
    description: String,
    startDates: [Date],
    nextStartDate: String,
    maxGroupSize: Number,
    ratingsAverage: Number,
    ratingsQuantity: Number,
    numReviews: Number,
    imageCover: String,
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWAR
//It run on the save() and create( command)
//The call back function would be called before a document is saved into the database
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Creating a Model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have at most 40 characters'],
      // minlength: [10, 'A tour name must have at least 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain alphabets'],
    },
    slug: String,
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    discount: {
      type: Number,
      validate: {
        //Custom Validator
        // This function does not  work on updating document
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    duration: Number,
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    images: [String],
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: String,
    startDates: [Date],
    nextStartDate: String,
    maxGroupSize: Number,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be at most 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: Number,
    numReviews: Number,
    imageCover: String,
    createdAt: { type: Date, default: Date.now },
    secreteTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON to specify Geolocation data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  // Virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Adding indexing to the most queried field to enhance performance
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//using virtual population to get the reviews of a tour without refrencing it in the tour schema
tourSchema.virtual('reviews', {
  ref: 'Review', //The model we are referencing
  foreignField: 'tour', //Tour is foreign field in the review model
  localField: '_id',
});

//DOCUMENT MIDDLEWARE
//It run on the save() and create( command)
//The call back function would be called before a document is saved into the database

//****Modeling tour guides by embedding****
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

//****Modeling tour guides by referencing****
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(`The query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// //AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
//   next();
// });
//Creating a Model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

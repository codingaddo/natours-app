const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewShema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Preventing multiple reviews from the same user on the same tour
reviewShema.index({ tour: 1, user: 1 }, { unique: true });

reviewShema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//Caling the Calculate Avg function after the review has been created
reviewShema.post('save', function () {
  //This points to the current review
  this.constructor.calcAverageRating(this.tour); //Getting reviews before declaration
});

//Caling the Calculate Avg function after the review has been deleted or updated

reviewShema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery());
  // console.log(this.r);
  next();
});

reviewShema.post(/^findOneAnd/, async function () {
  // this.review = this.findOne(); does not work here because in post the query has already be executed
  if (this.r) {
    await this.r.constructor.calcAverageRating(this.r.tour); //Getting reviews before declaration
  }
});

//Showing the user and tour that have been reviewed
reviewShema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});
const Review = mongoose.model('Review', reviewShema);

module.exports = Review;

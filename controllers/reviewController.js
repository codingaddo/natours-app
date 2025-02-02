const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

exports.createReview = catchAsync(async (req, res, next) => {
  //Allow nested routes
  //req.user.id will come from the protected route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.updateReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review: review,
//     },
//   });
// });

// exports.deleteReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndDelete(req.params.id);
//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

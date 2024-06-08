const express = require('express');

const {
  getAllReviews,
  createReview,
  getReview,
  deleteReview,
  updateReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

// router
//   .route('/:id')
//   .get(getReview)
//   .delete(deleteReview)
//   .patch(protect, restrictTo('user'), updateReview);
// router.route('/').get(getAllReviews);

module.exports = router;

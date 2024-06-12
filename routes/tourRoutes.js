const express = require('express');
// const { createReview } = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const {
  getAllTours,
  getTour,
  updateTour,
  createTour,
  deleteTour,
  checkId,
  checkBody,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

//Nexted routes using merge params
router.use('/:tourId/reviews', reviewRouter);

// router.param('id', checkId); // Parameter Middleware
router.route('/top-5-tour').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/distances/:latlng/unit/:unit').get(getDistances);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

//POST /tour/1224221ss2/reviews
//GET /tour/1224221ss2/reviews
//GET /tour/1224221ss2/reviews/3t3ty4
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;

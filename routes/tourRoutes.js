const express = require('express');
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
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', checkId); // Parameter Middleware
router.route('/top-5-tour').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;

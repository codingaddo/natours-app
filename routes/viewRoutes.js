const express = require('express');
const { protect, isLggedIn } = require('../controllers/authController');
const router = express.Router();
const {
  getOverview,
  getTour,
  getLoginForm,
} = require('../controllers/viewController');

router.use(isLggedIn);
router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;

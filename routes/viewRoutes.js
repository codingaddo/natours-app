const express = require('express');
const { protect, isLggedIn } = require('../controllers/authController');
const router = express.Router();
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
} = require('../controllers/viewController');

router.post('/submit-user-data', protect, updateUserData);
router.get('/me', protect, getAccount);

router.use(isLggedIn);
router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;

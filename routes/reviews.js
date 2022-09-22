//express
const express = require('express');

//controllers
const {
  getReviews, getReview, addReview, updateReview, deleteReview
} = require('../controllers/reviews');

//review model
const Review = require('../models/Review');

//protect middleware
const {protect, authorize} = require('../middlewares/auth')

//advanced results middleware
const advancedResults = require('../middlewares/advancedResults');

//router
const router = express.Router({
  mergeParams: true,
});

router.route('/').get(advancedResults(Review, {
  path: 'bootcamp',
  select: 'name description',
}), getReviews).post(protect, authorize('user', 'admin'), addReview)

router.route('/:id').get(getReview).put(protect, authorize('user', 'admin'), updateReview).delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router;

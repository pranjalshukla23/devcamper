//express
const express = require('express');

//controllers
const {
  getUsers, getUser, createUser, updateUser, deleteUser,
} = require('../controllers/users');

//user model
const User = require('../models/User');

//protect middleware
const {protect, authorize} = require('../middlewares/auth');

//advanced results middleware
const advancedResults = require('../middlewares/advancedResults');

//router
const router = express.Router({
  mergeParams: true,
});

//use protect middleware
router.use(protect);

//use authorize middleware
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;

//express
const express = require('express');

//controllers
const {
  getCourses, getCourse, addCourse, updateCourse, deleteCourse,
} = require('../controllers/courses');

//course model
const Course = require('../models/Course');

//protect middleware
const {protect, authorize} = require('../middlewares/auth')


//advanced results middleware
const advancedResults = require('../middlewares/advancedResults');

//router
const router = express.Router({
  mergeParams: true,
});

router.route('/').get(advancedResults(Course, {
  path: 'bootcamp',
  select: 'name description',
}), getCourses).post(protect,authorize('publisher', 'admin'), addCourse);

router.route('/:id').get(getCourse).put(protect,authorize('publisher', 'admin'), updateCourse).delete(protect,authorize('publisher', 'admin'), deleteCourse);

module.exports = router;

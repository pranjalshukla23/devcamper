//express
const express = require('express')

//include other resource routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

//Bootcamp model
const Bootcamp = require('../models/Bootcamp')

//protect and authorize middleware
const {protect, authorize} = require('../middlewares/auth')

//advanced results middleware
const advancedResults = require('../middlewares/advancedResults')


//controllers
const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp,
  deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload
} = require('../controllers/bootcamps');

//router
const router = express.Router()

//Re-Route into other resource routers
router.use('/:bootcampId/courses',courseRouter)
router.use('/:bootcampId/reviews',reviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect,authorize('publisher', 'admin'), createBootcamp)

router.route('/:id').get(getBootcamp).put(protect,authorize('publisher', 'admin'), updateBootcamp).delete(protect,authorize('publisher', 'admin'), deleteBootcamp)



module.exports = router

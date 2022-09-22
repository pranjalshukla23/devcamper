//bootcamp model
const Bootcamp = require('../models/Bootcamp');
//custom error class
const ErrorResponse = require('../utils/ErrorResponse');
//async handler middleware
const asyncHandler = require('../middlewares/async');
//geocoder
const geocoder = require('../utils/geocoder')
//path
const path = require('path')

//@desc    Get all bootcamps
//@route   GET /api/v1/bootcamps
//@access  public
const getBootcamps = asyncHandler(async (req, res, next) => {

  res.status(200).json(res.advancedResults);

});

//@desc    Get a single bootcamps
//@route   GET /api/v1/bootcamps/:id
//@access  public
const getBootcamp = asyncHandler(async (req, res, next) => {

  //find bootcamp by id
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    //call the error handler middleware
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`,
        404));
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });

});

//@desc    Create new bootcamp
//@route   POST /api/v1/bootcamps
//@access  private
const createBootcamp = asyncHandler(async (req, res, next) => {

  //Add user to request body
  req.body.user = req.user.id

  //check for published bootcamp by user id
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

  //if the user is  not an admin , they can only add one bootcamp
  if(publishedBootcamp && req.user.role !== 'admin'){
    //call the error middleware
    return (next(new ErrorResponse(`The user with ${req.user.id} has already published a bootcamp`, 400)))
  }

  //create a bootcamp in db
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });

});

//@desc    update bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@access  private
const updateBootcamp = asyncHandler(async (req, res, next) => {

  //find a bootcamp by id
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    //call the error handler middleware
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`,
        404));
  }

  //make sure user is bootcamp owner or the admin
  if(bootcamp.user.toString() !== req.user._id && req.user.role !== 'admin') {

    //call the error handler middleware
    return next(new ErrorResponse(`User ${req.user._id} is not authorized to update this bootcamp`,
        404));
  }

  //update a bootcamp
  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body,{
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: bootcamp,
  });

});

//@desc    delete bootcamp
//@route   DELETE /api/v1/bootcamps/:id
//@access  private
const deleteBootcamp = asyncHandler(async (req, res, next) => {

  //find a bootcamp by id
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    //call the error handler middleware
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`,
        404));
  }

  //make sure user is bootcamp owner or the admin
  if(bootcamp.user.toString() !== req.user._id && req.user.role !== 'admin') {

    //call the error handler middleware
    return next(new ErrorResponse(`User ${req.user._id} is not authorized to delete this bootcamp`,
        404));
  }

  //delete a bootcamp
  bootcamp.remove()

  res.status(200).json({
    success: true,
    data: {},
  });

});

//@desc    Get bootcamps within a radius
//@route   GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access  private
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {

  const {zipcode, distance} = req.params

  //get the latitude and longitude from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  //calculate the radius using radians
  //divide distance by radius of earth
  //earth radius = 3,963 miles / 6,378 kms
  const radius = distance / 3963

  //get bootcamps within a radius
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  })

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
})

  //@desc  upload photo for bootcamp
//@route   PUT /api/v1/bootcamps/:id/photo
//@access  private
  const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    //find a bootcamp by id
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      //call the error handler middleware
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`,
          404));
    }

    //make sure user is bootcamp owner or the admin
    if(bootcamp.user.toString() !== req.user._id && req.user.role !== 'admin') {

      //call the error handler middleware
      return next(new ErrorResponse(`User ${req.user._id} is not authorized to update this bootcamp`,
          404));
    }


    //if files not uploaded
    if(!req.files){

      //call the error handler middleware
     return next(new ErrorResponse(`Please upload a file`,
          404));
    }



    const file = req.files.file

    //make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
      //call the error handler middleware
      return next(new ErrorResponse(`Please upload an image file`,
          404));
    }

    //check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
      //call the error middleware
      return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,404))
    }

    //create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    //store file in a directory
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async(err) => {
      if(err){
        console.log(err)
        //call the error middleware
        return next(new ErrorResponse(`Problem with file upload`,500))
      }

      //store photo in bootcamp
      await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})

      res.status(200).json({
        success: true,
        data: file.name
      })
    })
  });

module.exports = {
  createBootcamp,
  updateBootcamp,
  getBootcamp,
  getBootcamps,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
};

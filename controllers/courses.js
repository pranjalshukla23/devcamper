//course model
const Course = require('../models/Course');
//bootcamp model
const Bootcamp = require('../models/Bootcamp');
//custom error class
const ErrorResponse = require('../utils/ErrorResponse');
//async handler middleware
const asyncHandler = require('../middlewares/async');


//@desc    Get courses
//@route   GET /api/v1/courses
//@route   GET /api/v1/bootcamps/:bootcampId/courses
//@access  public
const getCourses = asyncHandler(async(req,res,next) => {

  //if bootcamp id exist
  if(req.params.bootcampId){

    //find courses by id
    const courses = await Course.find({
      bootcamp: req.params.bootcampId
    })

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })

  }else{

    res.status(200).json(res.advancedResults)
  }


})


//@desc    Get single course
//@route   GET /api/v1/courses/:id
//@access  public
const getCourse = asyncHandler(async(req,res,next) => {

  //find course by id and add name and description field of associated bootcamp in the fetched record
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  if(!course){
    //call the error middleware
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
  }
  res.status(200).json({
    success: true,
    data: course
  })
})


//@desc    Add a course
//@route   POST /api/v1/bootcamps/:bootcampId/courses
//@access  private
const addCourse = asyncHandler(async(req,res,next) => {

  req.body.bootcamp = req.params.bootcampId

  req.body.user = req.user.id

  //find course by id
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if(!bootcamp){
    //call the error middleware
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404))
  }


  //make sure user is bootcamp owner or the admin
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {

    //call the error handler middleware
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to ${bootcamp._id}`,
        404));
  }


  //create a course
  const course = await Course.create(req.body)

  res.status(200).json({
    success: true,
    data: course
  })
})

//@desc    update course
//@route   PUT /api/v1/courses/:id
//@access  private
const updateCourse = asyncHandler(async(req,res,next) => {


  //find course by id
  let course = await Course.findById(req.params.id)


  if(!course){
    //call the error middleware
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
  }

  console.log(course)

  //make sure user is course owner or the admin
  if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {

    //call the error handler middleware
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update a course to ${course._id}`,
        404));
  }


  //find a course by id and update it
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: course
  })
})

//@desc    Delete a  course
//@route   DELETE /api/v1/courses/:id
//@access  private
const deleteCourse = asyncHandler(async(req,res,next) => {


  //find a course by id
  const course = await Course.findById(req.params.id)

  if(!course){
    //call the error middleware
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
  }

  //make sure user is course owner or the admin
  if(course.user.toString() !== req.user._id && req.user.role !== 'admin') {

    //call the error handler middleware
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete a course to ${course._id}`,
        404));
  }

  //remove a course
  await course.remove()

  res.status(200).json({
    success: true,
    data: {}
  })
})


module.exports = {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
}

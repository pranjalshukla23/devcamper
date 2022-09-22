//review model
const Review = require('../models/Review');
//bootcamp model
const Bootcamp = require('../models/Bootcamp');
//custom error class
const ErrorResponse = require('../utils/ErrorResponse');
//async handler middleware
const asyncHandler = require('../middlewares/async');



//@desc    Get reviews
//@route   GET /api/v1/reviews
//@route   GET /api/v1/bootcamps/:bootcampId/reviews
//@access  public
const getReviews = asyncHandler(async(req,res,next) => {

  //if bootcamp id exist
  if(req.params.bootcampId){

    //find review by id
    const reviews = await Review.find({
      bootcamp: req.params.bootcampId
    })

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })

  }else{

    res.status(200).json(res.advancedResults)
  }


})

//@desc    Get single review
//@route   GET /api/v1/reviews/:id
//@access  public
const getReview = asyncHandler(async(req,res,next) => {

  //find review by id and add name and description field of associated bootcamp in the fetched record
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  if(!review){
    //call error middleware
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
  }

  res.status(200).json({
    success: true,
    data: review
  })

})

//@desc    Add review
//@route   POST /api/v1/bootcamps/:bootcampId/reviews
//@access  private
const addReview = asyncHandler(async(req,res,next) => {

  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user._id

  //find bootcamp by id
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if(!bootcamp){

    //call error middleware
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`,404))

  }

  //create review
  const review = await Review.create(req.body)

  res.status(201).json({
    success: true,
    data: review
  })

})

//@desc    update review
//@route   PUT /api/v1/reviews/:id
//@access  private
const updateReview = asyncHandler(async(req,res,next) => {

  //find review by id
  let review = await Review.findById(req.params.id)

  if(!review){

    //call error middleware
    return next(new ErrorResponse(`No Review with the id of ${req.params.id}`,404))

  }

  //make sure review belongs to user or user is admin
  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    //call error middleware
    return next(new ErrorResponse(`Not authorized to updated review`,401))
  }

  //update review by id
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })


  res.status(200).json({
    success: true,
    data: review
  })

})


//@desc    delete review
//@route   DELETE /api/v1/reviews/:id
//@access  private
const deleteReview = asyncHandler(async(req,res,next) => {

  //find review by id
  const review = await Review.findById(req.params.id)

  if(!review){

    //call error middleware
    return next(new ErrorResponse(`No Review with the id of ${req.params.id}`,404))

  }

  //make sure review belongs to user or user is admin
  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    //call error middleware
    return next(new ErrorResponse(`Not authorized to updated review`,401))
  }

  //remove review from db
  await review.remove()


  res.status(200).json({
    success: true,
    data: {}
  })

})
module.exports = {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
}

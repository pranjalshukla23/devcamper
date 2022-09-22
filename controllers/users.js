//user model
const User = require('../models/User');
//custom error class
const ErrorResponse = require('../utils/ErrorResponse');
//async handler middleware
const asyncHandler = require('../middlewares/async');


//@desc    Get all users
//@route   GET /api/v1/users
//@access  private/Admin
const getUsers = asyncHandler(async (req, res, next) => {

  res.status(200).json(res.advancedResults)

});


//@desc    Get single user
//@route   GET /api/v1/users/:id
//@access  private/Admin
const getUser = asyncHandler(async (req, res, next) => {

  //find user by id
  const user = await User.findById(req.params.id)

  res.status(200).json({
    success: true,
    data: user
  })

});


//@desc    create user
//@route   POST /api/v1/users
//@access  private/Admin
const createUser = asyncHandler(async (req, res, next) => {

  //create user
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user
  })

});


//@desc    update user
//@route   PUT /api/v1/users/:id
//@access  private/Admin
const updateUser = asyncHandler(async (req, res, next) => {

  //update user
  const user = await User.findByIdAndUpdate(req.params.id,req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: user
  })

});

//@desc    delete user
//@route   DELETE /api/v1/users/:id
//@access  private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {

  //delete user
  await User.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    data: {}
  })

});



module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getUsers
}

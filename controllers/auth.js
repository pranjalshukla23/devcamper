//user model
const User = require('../models/User');
//custom error class
const ErrorResponse = require('../utils/ErrorResponse');
//async handler middleware
const asyncHandler = require('../middlewares/async');
//send email function
const sendEmail = require('../utils/sendEmail');
//crypto
const crypto = require('crypto');

//@desc    register user
//@route   GET /api/v1/auth/register
//@access  public
const register = asyncHandler(async (req, res, next) => {

  const {name, email, password, role} = req.body;

  //create user in db
  const user = await User.create({
    name,
    email,
    password,
    role,
  });


  sendTokenResponse(user,200,res)
});

//@desc    login user
//@route   POST /api/v1/auth/login
//@access  public
const login = asyncHandler(async (req, res, next) => {

  const {email, password} = req.body;

  //validate email and password
  if (!email || !password) {
    //call the error middleware
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //check for user in db
  const user = await User.findOne({email}).select('+password');

  //check if user exists
  if (!user) {
    //call error middleware
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  //check if password matches
  //call static method defined in schema
  const isMatch = await user.matchPassword(password);

  //if password does not match
  if (!isMatch) {
    //call error middleware
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendTokenResponse(user, 200, res)
});


//@desc    log user out / clear cookie
//@route   GET /api/v1/auth/logout
//@access  private
const logout = asyncHandler(async(req,res,next) => {

  //set cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    data: {}
  })
})


//@desc    Get current logged in user
//@route   GET /api/v1/auth/me
//@access  private
const getMe = asyncHandler(async(req,res,next) => {

  //find user by id
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user
  })
})

//@desc    Update user details
//@route   PUT /api/v1/auth/updatedetails
//@access  private
const updateDetails = asyncHandler(async(req,res,next) => {

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  }

  //find user by id and update it
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: user
  })
})

//@desc    Update password
//@route   PUT /api/v1/auth/updatepassword
//@access  private
const updatePassword = asyncHandler(async(req,res,next) => {

  //find user by id along with password field
  const user = await User.findById(req.user.id).select('+password')

  //check current password
  if(!(await user.matchPassword(req.body.currentPassword))){

    //call the error middleware
    return next(new ErrorResponse("Password is incorrect", 401))
  }

  user.password = req.body.newPassword

  //save the user in db
  await user.save()

  sendTokenResponse(user, 200, res)
})

//@desc    Forgot password
//@route   POST /api/v1/auth/forgotpassword
//@access  public
const forgotPassword = asyncHandler(async(req,res,next) => {

  //find user by id
  const user = await User.findOne({
    email: req.body.email
  })

  if(!user){
    //call the error middleware
    return next(new ErrorResponse("There is no user with that email",404))
  }

  //get reset token
  //call method defined in schema
  const resetToken = user.getResetPasswordToken()

  //save user in db
  await user.save({
    validateBeforeSave: false
  })

  //create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

  const message = `You are receiving this email because you (or someone else) has 
  requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try{

    //send email
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    })

    res.status(200).json({
      success: true,
      data: 'Email sent'
    })
  }catch(err){
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    //save the user in db
    await user.save({
      validateBeforeSave: false
    })

    //call the error middleware
    return next(new ErrorResponse(`Email could not be sent`,500))

  }
})


//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {

  //create token
  //invoking static method defined in schema
  const token = user.getSignedJwtToken();

  //set cookie configuration
  const options = {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if(process.env.NODE_ENV === 'production'){
    options.secure = true
  }

  //set cookie and send response
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });

};

//@desc    Reset Password
//@route   PUT /api/v1/auth/resetpassword/:resettoken
//@access  public
const resetPassword = asyncHandler(async(req,res,next) => {

  //Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

  //find user by reset token and reset password expiration
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now()
    }
  })

  if(!user){
   //call the error middleware
    return next(new ErrorResponse("Invalid token",400))
  }

  //set new password
  user.password =  req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  //save user in db
  await user.save()

  sendTokenResponse(user, 200, res)

})


module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
};

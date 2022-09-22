const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

//middleware to protect routes
const protect = asyncHandler(async(req,res,next) => {

  let token;

  //set token from header
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

    //get token from header
    token = req.headers.authorization.split(' ')[1]

  }
  //check if cookie exist
  //set token from cookie
  else if(req.cookies.token){

    //set token from cookie
    token = req.cookies.token
  }

  //make sure token exists
  if(!token){
    //call the error middleware
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }


  try{

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log(decoded)

    //find user in db by id
    req.user = await User.findById(decoded.id)

    //call the next middleware
    next()
  }catch(err){
    //call the error middleware
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }
})

//middleware to grant access to specific roles
const authorize = (...roles) => (req,res,next) => {

  if(!roles.includes(req.user.role)){
    //call the error middleware
    return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
  }

  //call the next middleware
  next()

}

module.exports = {
  protect,
  authorize
}

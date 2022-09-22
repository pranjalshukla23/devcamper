
//custom error class
const ErrorResponse = require('../utils/errorResponse');

//error handler middleware
//middleware to handle errors
const errorHandler = (err, req, res, next) => {

  let error = {...err}

  error.message = err.message

  //log to console for dev
  console.log(err)

  //Mongoose bad ObjectId
  if(err.name === 'CastError'){
    const message = `Resource not found`
    error = new ErrorResponse(message, 404)
  }

  //Mongoose duplicate key
  if(err.code === 11000){
    const message = 'Duplicate filed value entered'
    error = new ErrorResponse(message, 400)
  }

  //Mongoose validation error
  if(err.name === 'ValidationError'){
    const message = Object.values(err.errors).map(val => val.message)
    console.log(message)
    error = new ErrorResponse(message,400)
  }

  //send response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorHandler

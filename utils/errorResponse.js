
//custom error class
class ErrorResponse extends Error{

  //constructor
  constructor(message, statusCode){
    //invoke super class constructor
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = ErrorResponse

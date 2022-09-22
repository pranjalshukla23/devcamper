//mongoose
const mongoose = require('mongoose')
//bcrypt
const bcrypt = require('bcryptjs')
//jsonwebtoken
const jwt = require('jsonwebtoken')
//crypto
const crypto = require('crypto')

//create a schema
const UserSchema = new mongoose.Schema({

  name:{
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role:{
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password:{
    type: String,
    required: [true, 'Please add a password'],
    minLength: 6,
    select: false
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpired:{
    type: Date,
  },
  createdAt:{
    type: Date,
    dfault: Date.now
  }
})

//middleware to encrypt password
//this middleware will run before a record is saved in db
UserSchema.pre('save', async function(next){

  if(!this.isModified('password')){

    //go to next middleware
    next()
  }
  //generate salt
  const salt = await bcrypt.genSalt(10)

  //hash the password
  this.password = await bcrypt.hash(this.password, salt)
})

//define static method to sign jwt and return it
UserSchema.methods.getSignedJwtToken = function(){

  //sign and return a token
  return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRE
  })
}

//define static method to match entered password and hashed password in db
UserSchema.methods.matchPassword = async function(enteredPassword){

  //verify the password
  return await bcrypt.compare(enteredPassword, this.password)
}

//static method to generate and hash password token
UserSchema.methods.getResetPasswordToken = function(){

  //generate token
  const resetToken = crypto.randomBytes(20).toString('hex')

  //hash the token and set to resetPassword field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  //set the expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken

}

//define a model
module.exports = mongoose.model('User', UserSchema)

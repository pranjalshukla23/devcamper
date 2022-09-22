//fs
const fs = require('fs')
//mongoose
const mongoose = require('mongoose')
//colors
const colors = require('colors')
//dotenv
const dotenv = require('dotenv')

//load env vars
dotenv.config({
  path: './config/config.env'
})

//load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

//function to connect to db
const connectDB = async() => {

  //connect to db
  const conn = await mongoose.connect(process.env.MONGO_URI)

  console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline.bold)
}

connectDB()

//read json files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'))

//read json files
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'))

//read json files
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`,'utf-8'))

//read json files
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`,'utf-8'))


//import into db
const importData = async() => {
  try{
    //create bootcamps
    await Bootcamp.create(bootcamps)
    //create courses
    await Course.create(courses)
    //create users
    await User.create(users)
    //create reviews
    await Review.create(reviews)

    console.log('Data Imported...'.green.inverse)
    process.exit()
  }catch(error){
    console.log(error)
  }
}

//delete data
const deleteData = async() => {
  try{
    //delete bootcamps
    await Bootcamp.deleteMany()
    //delete courses
    await Course.deleteMany()
    //delete users
    await User.deleteMany()
    //delete reviews
    await Review.deleteMany()

    console.log('Data Destroyed...'.red.inverse)
    process.exit()
  }catch(error){
    console.log(error)
  }
}

//node seeder -i
if(process.argv[2] === '-i') {
  importData()

  //node seeder -d
}else if(process.argv[2] === '-d'){
  deleteData()
}

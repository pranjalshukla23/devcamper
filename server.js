//express
const express = require('express')

//morgan
const morgan = require('morgan')

//colors
const colors = require('colors')

//express-mongo-sanitize
const mongoSanitize = require('express-mongo-sanitize')

//helmet
const helmet = require('helmet')

//helmet
const xss = require('xss-clean')

//express-rate-limit
const rateLimit = require('express-rate-limit')

//hpp
const hpp = require('hpp')

//cors
const cors = require('cors')

//dotenv
const dotenv = require('dotenv')

//path
const path = require('path')

//connect to db function
const connectDB = require('./config/db')

//load env vars
dotenv.config({path: './config/config.env'})

//logger middleware
const logger = require('./middlewares/logger');

//error middleware
const errorHandler = require('./middlewares/error');

//route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

//file upload
const fileupload = require('express-fileupload')

//cookie parser
const cookieParser = require('cookie-parser')

//create express app
const app = express()

//use body parser middleware
app.use(express.json())

//middleware to use cookie parser
app.use(cookieParser())

//middleware to prevent XSS attacks
app.use(xss())

//middleware to enable cors
app.use(cors())

//rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000 , //10  mins
  max: 100 // 100 request per 10 mins
})

//middleware to use rate limiting
app.use(limiter)

//app to prevent hpp param pollution
app.use(hpp())

//connect to db
connectDB()

//use logger middleware
//app.use(logger)

if(process.env.NODE_ENV === 'development') {

  //use morgan middleware for logging requests
  app.use(morgan('dev'))
}

//use middleware for file uploading
app.use(fileupload())

//use middleware for sanitizing data
app.use(mongoSanitize())

//use middleware to set security headers
app.use(helmet({ contentSecurityPolicy: false }));

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//mount routers
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)
app.use('/api/v1/users',users)
app.use('/api/v1/reviews',reviews)

//use error handler middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT,() => {
  console.log(`Server running in ${process.env.NODE_ENV} mode and on  port ${PORT}`.yellow.bold)
})

//handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
  console.log(`Error: ${err.message}`.red)
  //close server and exit process
  server.close(() => process.exit(1))
})

//mongoose
const mongoose = require('mongoose')

//create a schema
const CourseSchema = new mongoose.Schema({

  title:{
    type: String,
    trim: true,
    required: [true,'Please add a course title']
  },
  description:{
    type: String,
    required: [true, 'Please add a description']
  },
  weeks:{
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition:{
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill:{
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner','intermediate', 'advanced']
  },
  scholarshipAvailable:{
    type: Boolean,
    required: false
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  bootcamp:{
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
})

//define static method in Course schema
//static method to get average of course tuition
CourseSchema.statics.getAverageCost = async function(bootcampId){

  console.log("Calculating average cost...".blue)

  //run aggregate function to sum all the tuition fees of courses with the specified bootcamp id
  const obj = await this.aggregate([
    {
      $match: {bootcamp: bootcampId}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {
          $avg: '$tuition'
        }
      }
    }
  ])

  try{

    //find and update bootcamp by id
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    })
  }catch(err){
    console.log(err)
  }
}

//Mongoose model

//call getAverageCost after save
//this middleware will run after a document is saved
CourseSchema.post('save', function(){

  //call static method defined in  schema
  this.constructor.getAverageCost(this.bootcamp)
})

//call getAverageCost before remove
//this middleware will run before a document is removed
CourseSchema.pre('remove', function(){

  //call static method defined in schema
  this.constructor.getAverageCost(this.bootcamp)
})


//create a model and export it
module.exports = mongoose.model('Course', CourseSchema)

//mongoose
const mongoose = require('mongoose')

//create a schema
const ReviewSchema = new mongoose.Schema({

  title:{
    type: String,
    trim: true,
    required: [true,'Please add a title for the review'],
    maxLength: 100
  },
  text:{
    type: String,
    required: [true, 'Please add some text']
  },
  rating:{
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
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

//prevent user from submitting more than one review per bootcamp
//define index for schema
ReviewSchema.index({
  bootcamp: 1,
  user: 1
}, {
  unique: true
})

//define static method in Review schema
//static method to get average rating
ReviewSchema.statics.getAverageRating = async function(bootcampId){

  console.log("Calculating average rating...".blue)

  //run aggregate function to sum all the ratings of reviews with the specified bootcamp id
  const obj = await this.aggregate([
    {
      $match: {bootcamp: bootcampId}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: {
          $avg: '$rating'
        }
      }
    }
  ])

  try{

    //find and update bootcamp by id
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
      averageRating: obj[0].averageRating
    })
  }catch(err){
    console.log(err)
  }
}

//Mongoose model

//call getAverageRating after save
//this middleware will run after a document is saved
ReviewSchema.post('save', function(){

  //call static method defined in  schema
  this.constructor.getAverageRating(this.bootcamp)
})

//call getAverageRating before remove
//this middleware will run before a document is removed
ReviewSchema.pre('remove', function(){

  //call static method defined in schema
  this.constructor.getAverageRating(this.bootcamp)
})

//create a model and export it
module.exports = mongoose.model('Review', ReviewSchema)

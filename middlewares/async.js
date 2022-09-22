
//async handler middleware
//middleware to handle async requests
const asyncHandler = fn => (req,res,next) => {

  Promise.
      resolve(fn(req,res,next))
      .catch(next)
}

module.exports = asyncHandler

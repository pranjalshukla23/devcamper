
//middleware
//middleware to paginate, filter and sort data
const advancedResults = (model, populate) => async(req, res, next) => {

  let query;

  //copy req.query
  const reqQuery = {...req.query}

  //fields to exclude while filtering
  const removeFields = ['select', 'sort', 'page', 'limit']

  //loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param])

  console.log("original query:",reqQuery)

  //create query string
  //convert JSON to string
  let queryStr = JSON.stringify(reqQuery)

  //create operators ($gt, $gte etc)
  //replace a string with another string
  // e.g - {"averageCost":{"lte":"10000"}} -> {"averageCost":{"$lte":"10000"}}
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

  console.log("new query string:",queryStr)

  //finding documents in db
  query = model.find(JSON.parse(queryStr))

  //Select fields
  if(req.query.select){

    //store the fields to fetch from a document in db
    const fields = req.query.select.split(',').join(' ')

    console.log("get fields:",fields)

    //fetch the documents with the selected fields
    query = query.select(fields)
  }

  //sort
  //if sort query is present
  if(req.query.sort){

    //store the fields to sort a document with
    const sortBy = req.query.sort.split(',').join(' ')

    console.log("sort fields:",sortBy)

    //sort the fetched documents in order of fields
    query = query.sort(sortBy)

    //if sort query is not present
  }else{

    //sort the documents in descending order of createdAt field
    query = query.sort('-createdAt')
  }

  //Pagination

  //get page number
  const page = parseInt(req.query.page, 10) || 1
  //get the number of documents to view per page
  const limit = parseInt(req.query.limit, 10) || 25
  //get starting index of document for the current page
  const startIndex = (page - 1) * limit
  //get end index of document for the current page
  const endIndex = page * limit
  //get total number of documents
  const total = await model.countDocuments()

  //fetch the documents from db
  query = query.skip(startIndex).limit(limit)

  if(populate){

    //add fields to fetched documents
    query = query.populate(populate)
  }
  //executing query
  const results = await query;

  //Pagination result
  const pagination = {}

  //if next page exist
  if(endIndex < total){

    //set next page
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  //if previous page exists
  if(startIndex > 0){

    //set previous page
    pagination.prev = {
      page: page -1 ,
      limit
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }

  //call next middleware
  next()


}

module.exports = advancedResults

//node-geocoder
const NodeGeocoder = require('node-geocoder')


//define configurations
const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
}

//create instance of NodeGeocoder
const geocoder = NodeGeocoder(options)

module.exports = geocoder

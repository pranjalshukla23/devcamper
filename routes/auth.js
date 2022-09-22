//express
const express = require('express')

//controllers
const {register, login, getMe, forgotPassword, resetPassword, updateDetails,
  updatePassword, logout
} = require('../controllers/auth')

//protect middleware
const {protect} = require('../middlewares/auth');

//router
const router = express.Router()


router.post('/register',register)

router.post('/login',login)

router.get('/logout',logout)

router.get('/me', protect, getMe)

router.put('/updatedetails', protect, updateDetails)

router.put('/updatepassword', protect, updatePassword)

router.post('/forgotpassword', forgotPassword)

router.put('/resetpassword/:resettoken', resetPassword)


module.exports = router

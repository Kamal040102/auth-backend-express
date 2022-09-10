const router = require('express').Router()
const { register, login, changePassword, getUserDetail, resetPassword, changeResetPassword, verifyEmail } = require('../controllers/Auth.controller')
const { isAuthenticated } = require('../middlewares/Auth.middleware')

// Public Routes
router.post('/register', register)
router.post('/login', login)
router.post('/resetpassword', resetPassword)
router.post('/changeresetpassword/:id/:token', changeResetPassword)
router.get('/verify/:token', verifyEmail)

// Authenticated Routes
router.post('/changepassword',isAuthenticated, changePassword)
router.post('/me', isAuthenticated, getUserDetail)

module.exports = router;
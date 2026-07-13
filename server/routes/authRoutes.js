const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { getuserprofile, updateuserprofile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/logout', protect, logout);
router.post('/logout', protect, logout);
router.get('/profile', protect, getuserprofile);
router.put('/profile', protect, updateuserprofile);

module.exports = router;

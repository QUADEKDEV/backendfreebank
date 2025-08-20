const express= require('express');
const { loginPage, login, signup, resolveAccount, transfer, history, updateProfile, authToken, requestOtp, changePassword } = require('../controllers/usercontrolles');
const router = express.Router();
router.post('/login',login);
router.post('/signup',signup);
router.post("/changepassword",changePassword);
router.post('/requestotp',requestOtp);
router.post('/resolveaccount',authToken,resolveAccount);
router.post("/transfer",authToken,transfer);
router.post("/history",authToken,history);
router.post("/updateprofile/:id",authToken,updateProfile);

module.exports = router
const express = require('express');
const app = express();
const cors= require('cors');
const mongoose = require('mongoose');
const dotenv=require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
const Userrouter=require('./routes/userroutes.js');
app.use('/user',Userrouter);

mongoose.connect(process.env.DB_URI)
.then(()=>{
    console.log('Database connected sucessfully');
})
.catch((error)=>{
console.log(error);
})




const port = 5000;
app.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
});











// //BRUTEFORCEEEEEEEEEEEEEE

// const hashedPassword = "$2b$10$t4CKheYLf6mH1mH5S8g3fO6/hU053rOUObMCe1mykJno7nUk2QkVa"

// // Characters allowed in password guesses
// const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// // Generate a random string of given length
// function generateRandomPassword(length) {
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
//     result += randomChar;
//   }
//   return result;
// }

// async function bruteForce(maxAttempts = 10000000, passwordLength = 9) {
//   for (let i = 0; i < maxAttempts; i++) {
//     const guess = generateRandomPassword(passwordLength);
//     const match = await bcrypt.compare(guess, hashedPassword);
//     if (match) {
//       console.log(`✅ Password matched: "${guess}" after ${i + 1} attempts`);
//       return;
//     }
//     if (i % 100 === 0) {
//       console.log(`Attempt ${i + 1}: ${guess}`);
//     }
//   }

//   console.log("❌ No match found within max attempts.");
// }

// bruteForce();

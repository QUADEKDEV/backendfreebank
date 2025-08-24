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













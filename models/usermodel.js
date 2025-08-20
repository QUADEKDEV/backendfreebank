const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage:{type:String, default:''},
  password: { type: String, required: true },
  accountBalance: { type: Number, default: 100 },
 accountNumber:  { type: String },
  isAdmin: { type: Boolean, required: false, default: false },
  dateCreated: { type: String, default: Date.now() },
});
const userModel=mongoose.model("Users",UserSchema);

// UserSchema.pre("save",async function (next) {
  
//   next();
// })
module.exports=userModel;
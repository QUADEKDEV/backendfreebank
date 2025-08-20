const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  senderId: {type: String,required: true},
  receiverId: {type: String,required: true},
  amount: { type: Number, required: true },
  created_at: { type: String, default: Date.now() },
  description: { type: String },
  status:{type: String,required: true}
});
const historyModel = mongoose.model("history", historySchema);

module.exports = historyModel;

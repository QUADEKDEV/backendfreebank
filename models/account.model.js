const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
  accountnum: {
    type: Number,
  },
});
const accountModel = mongoose.model("genaccount", accountSchema);

module.exports = accountModel;

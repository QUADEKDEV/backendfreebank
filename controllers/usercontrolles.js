const bcrypt = require("bcryptjs");
const userModel = require("../models/usermodel.js");
const accountModel = require("../models/account.model.js");
const historyModel = require("../models/history.model.js");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { all } = require("../routes/userroutes.js");
const cloudinary = require("cloudinary");
const otpGenerator = require("otp-generator");


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

let message;
let OTP;
const transfer = async (req, res) => {
  const { accountNumber, amount, description, senderId } = req.body;
  try {
    let sender = await userModel.findById(senderId);
    if (sender) {
      if (Number(amount) > Number(sender.accountBalance)) {
        message = "Insufficient Fund";
        res.send({ message, status: false });
      } else {
        let receiver = await userModel.findOne({ accountNumber });
        if (receiver) {
          if (senderId == receiver._Id) {
            message="Can not trransfer fund to yourself"
            res.send({ message, status: false });
          } 
          else {
            let status = "Pending";
            let senderbalance = Number(sender.accountBalance) - Number(amount);
            await userModel.findByIdAndUpdate(senderId, {
              accountBalance: senderbalance,
            });
            let receiverbalance =
              Number(receiver.accountBalance) + Number(amount);
            await userModel.findByIdAndUpdate(receiver._id, {
              accountBalance: receiverbalance,
            });
            status = "Completed";
            await historyModel.create({
              senderId: sender._id,
              receiverId: receiver._id,
              amount: amount,
              description: description,
              status,
            });

            res.send({ message: receiver, status: true });
          }
        }
      }
    }
  } catch (error) {
    message = "cannot make transfer at this time";
    res.send({ message, status: false });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (user) {
      let chk = await bcrypt.compare(password, user.password);
      if (!chk) {
        message = "Invalid Credentials";
        res.json({ status: false, message });
      } else {
        let token = jwt.sign({ user: user._id }, process.env.APP_PASS, {
          expiresIn: "1hr",
        });
        let person = {
          id: user._id,
          name: user.name,
          email: user.email,
          accountBalance: user.accountBalance,
          profileImage: user.profileImage,
          accountNumber: user.accountNumber,
        };
        res.send({ person, token, status: true });
      }
    } else {
      message = "Invalid Credentials";
      res.json({ status: false, message });
    }
  } catch (error) {
    message = "cannot sign you in at this time";
    res.send({ message, status: false });
  }
};

const history = async (req, res) => {
  const { id } = req.body;
  let allhistory = await historyModel.find();
  let transaction = allhistory.filter((story) => {
    if (story.senderId == id || story.receiverId == id) {
      return story;
    } else {
      return false;
    }
  });

  res.send({ transaction, status: true });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let genAccount = await accountModel.findById("688a47da93c36d49081c80f3");
    let accountnumber = "SGB" + (Number(genAccount.accountnum) + 1);
    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);
    await userModel.create({
      name,
      email,
      password: hashedPassword,
      accountNumber: accountnumber,
      profileImage:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX0VyN1J2YLz6nBdYl-uu05expOKPwJ5BhHHdHzfZAwZh7onXXC3fDa3QgBMwaVCD5VlA&usqp=CAU",
    });

    await accountModel.findByIdAndUpdate("688a47da93c36d49081c80f3", {
      accountnum: Number(genAccount.accountnum) + 1,
    });

    res.json(name);
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_MAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.NODE_MAIL,
      to: email,
      subject: "Account Created!!! 🥳🥳",
      html: `<h1>Hello ${name}, Welcome to Free Bank your account Number is ${accountnumber}</h1>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    if (error.code == 11000) {
      message = "User already exist";
      res.send({ status: false, message });
    } else {
      message = "Error creating user";
      res.send({ status: false, message });
    }
  }
};

const resolveAccount = async (req, res) => {
  const { accountNumber } = req.body;

  try {
    let user = await userModel.findOne({ accountNumber });
    if (!user) {
      res.json({ status: false, message: "invalid account details" });
    } else {
      res.json({
        status: true,
        name: user.name,
      });
    }
  } catch (error) {
    res.json({ status: false, message: "Error getting account at this time" });
  }
};
const authToken = (req, res, next) => {
  let authHeaders = req.headers["authorization"];

  const token = authHeaders && authHeaders.split(" ")[1];
  console.log(token);

  if (!token) {
    message = "unauthorized";
    res.send({ message, status: false });
  }

  jwt.verify(token, process.env.APP_PASS, (err, user) => {
    if (err) {
      message = "invalid token";
      res.send({ message, status: false });
    } else {
      next();
    }
  });
};

const requestOtp = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      message = "User doesn not exist";
      res.send({ message, staus: false });
    } else {
      OTP = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
      });


let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_MAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.NODE_MAIL,
      to: email,
      subject: "OTP REQUEST!!!",
      html: `<h1>Hello ${user.name}, use ${OTP} as your OTP</h1>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
      message = "OTP sent to your mail";

      res.send({ message, OTP, staus: true });
    }
  } catch (error) {
    message = "error verifying you";
    res.send({ message });
  }
};

const changePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  console.log(email);
  // console.log(emaill)
  if (email && otp == OTP) {
    let user = await userModel.findOne({ email });
    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(newPassword, salt);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
    message = "Password updated successfully";
    res.send({ message,status:true });
  } else {
    //  message='Password updated successfully'
    res.send({});
  }
};

const updateProfile = async (req, res) => {
  const { profileImage } = req.body;
  const { id } = req.params;
  try {
    await cloudinary.v2.uploader.upload(profileImage, async (error, result) => {
    if (error) {
      message = "cannot upload file at the moment";
    } else {
      image = result.secure_url;
      await userModel.findByIdAndUpdate(id, {
        profileImage: image,
      });
      message = "profile image updated successfully";
      res.send({ message,staus:true });
    }
  });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  login,
  signup,
  resolveAccount,
  transfer,
  authToken,
  history,
  changePassword,
  requestOtp,
  updateProfile,
};

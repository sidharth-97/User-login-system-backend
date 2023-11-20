import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModel.js";
import generateToken from "../utils/generateToken.js";
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'


const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image:user.image
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const generateOTP=() => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp
}

const sendMail = (email, verificationCode) => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASS,
      
    },
  });

  const mailOptions = {
    from: process.env.MAIL,
    to: email,
    subject: "Login Verification",
    text: `${email}, your verification code is: ${verificationCode}. Do not share this code with anyone.`,
  };

  mailTransporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Verification code sent successfully");
    }
  });
};

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, name, password,phone,DOB} = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  } else {
    const code = generateOTP()
    sendMail(email,code)
    const user = await User.create({
      name,
      email,
      phone,
      DOB,
      password,
      code
    });
    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user");
    }
  }
});

const verifyUser = asyncHandler(async (req, res) => {
  const { email, otp } = req.body
  const user = await User.findOne({ email: email })
  if (user) {
    if (user.code == otp) {
      await User.updateOne(
        { email },
        { $set: { isVerified: true }, $unset: { code: 1 } }
      );
      res.status(200).json("Verification completed")
    } else {
      res.status(401)
       throw new Error("Verification failed")
    }
  } else {
    res.status(404)
      ("Invalid email")
  }
})

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json("User logged out");
});

const addProduct = asyncHandler(async (req, res) => {
  const { Pname, quantity, price, discountType } = req.body
  let image = []
  for (const file of req.files) {
      image.push(file.filename)
  }
  const product = await Product.create({
    Pname, quantity, price, discountType,image,thumbnail:image[0]
  })

  if (product) {
    res.status(201).json("Product added")
  } else {
    throw new Error("Something went wrong")
  }
})

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404).json("User not found");
    return;
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (isPasswordMatch) {
    const salt=await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword,salt); 
    user.password = hashedPassword;
    await user.save();
    res.status(200).json("Password updated successfully");
  } else {
    res.status(401).json("Incorrect old password");
  }
});



export {
  authUser,
  registerUser,
  logoutUser,
  verifyUser,
  addProduct,
  changePassword
};

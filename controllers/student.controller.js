import Student from "../models/Student.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";
import crypto from "crypto";

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(`${otp}${process.env.OTP_SECRET}`).digest("hex");
};

export const register = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password, className, interests, codingLevel, buildPreference } = req.body;
    // Validate
    if (!fullName || !email || !mobileNumber || !password || !className || !interests?.length || !codingLevel || !buildPreference) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }


    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobileNumber },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User
    const user = await User.create({
      fullName: fullName,
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber.trim(),
      password: hashedPassword,
    });

    console.log("Checking for existing user with email:", email, "or mobile number:", mobileNumber);

    // Create Student profile
    const student = await Student.create({
      userId: user._id,
      name: fullName,
      classes: className,
      enjoy: interests,
      level: codingLevel,
      build: buildPreference,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
      student,
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;

    // Validate
    if ((!email && !mobileNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile number and password are required",
      });
    }

    // Find user
    const query = email ? { email: email.toLowerCase().trim() } : { mobileNumber: mobileNumber.trim() };
    const user = await User.findOne(query).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HttpOnly Cookie
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const mobile = mobileNumber.trim();

    const user = await User.findOne({ mobileNumber: mobile });

    // Avoid revealing whether an account exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this number is registered, an OTP will be sent.",
      });
    }

    // Generate a cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = hashOTP(otp);

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Replace any previous OTP for this user
    await PasswordResetOTP.findOneAndUpdate(
      { userId: user._id },
      {
        otpHash,
        expiresAt,
        attempts: 0,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // Send OTP through SMS provider
    await sendSMS(
      mobile,
      `Your password reset OTP is ${otp}. It expires in 5 minutes.`
    );

    return res.status(200).json({
      success: true,
      message: "If this number is registered, an OTP will be sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process your request right now",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        mobileNumber: req.user.mobileNumber,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user",
    });
  }
};
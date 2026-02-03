import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Recruiter from "../models/Recruiter.js";

const SALT_ROUNDS = 10;

/**
 * POST /auth/register
 * Body: { email, password }
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await Recruiter.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const recruiter = await Recruiter.create({ email, passwordHash });

    const token = jwt.sign(
      { id: recruiter._id, email: recruiter.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Recruiter registered successfully",
      token,
      recruiter: { id: recruiter._id, email: recruiter.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, recruiter.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: recruiter._id, email: recruiter.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      recruiter: { id: recruiter._id, email: recruiter.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /auth/me
 * Headers: Authorization: Bearer <token>
 */
export const getMe = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.recruiter.id);
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    res.json({
      recruiter: { id: recruiter._id, email: recruiter.email },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

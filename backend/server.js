import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pg from "pg";
import dns from "dns";

import authenticateToken from "./middleware/authMiddleware.js";

dns.setDefaultResultOrder("ipv4first");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

/* -------------------- SAFETY CHECK -------------------- */

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in environment variables");
  process.exit(1);
}

if (!process.env.SUPABASE_CONNECTION_STRING) {
  console.error("❌ SUPABASE_CONNECTION_STRING is missing");
  process.exit(1);
}

/* -------------------- MIDDLEWARE -------------------- */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* -------------------- DATABASE -------------------- */

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

db.on("connect", () => {
  console.log("✅ Database connected successfully");
});

db.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

/* -------------------- AUTH ROUTES -------------------- */

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check existing user (LOWERCASE TABLE NAME IS CRITICAL)
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // RETURN ONLY REQUIRED FIELDS
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "Signup successful",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error.message);
    return res.status(500).json({
      message: "Signup failed",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

/* -------------------- PROTECTED ROUTES -------------------- */

app.get("/alerts", authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.TOM_TOM_API;

    const response = await axios.get(
      "https://api.tomtom.com/traffic/services/5/incidentDetails",
      {
        params: {
          key: apiKey,
          bbox: "85.75,20.25,85.90,20.35",
          fields:
            "{incidents{type,geometry{type,coordinates},properties{iconCategory,id,events{description},magnitudeOfDelay,tmc{points{location}}}}}",
          language: "en-GB",
          timeValidityFilter: "present",
        },
      }
    );

    return res.json(response.data.incidents);
  } catch (error) {
    console.error("❌ ALERTS ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

app.get("/detect", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(
      "https://monitoring-python-892386181347.asia-south1.run.app/vehicle_counts"
    );
    return res.json(response.data);
  } catch (error) {
    console.error("❌ DETECT ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch vehicle data" });
  }
});

/* -------------------- SERVER -------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


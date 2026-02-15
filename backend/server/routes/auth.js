import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../supabase.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const { error } = await supabase
    .from("users")
    .insert([{ name, email, password: hashedPassword }]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "User created successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true in production (https) // change to true when deploying to production with HTTPS
  });

  res.json({ message: "Logged in successfully" });
});

router.get("/isAuth", (req, res) => {
  const token = req.cookies.token;
  const result = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ isAuth: false });
    } else {
      return res.json({ isAuth: true, userId: decoded.userId });
    }
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax", // or "none" if using HTTPS + cross-origin
    secure: false, // true if using HTTPS
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export default router;

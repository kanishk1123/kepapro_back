import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import cors from "cors";
import usermodel from "./model/user.js";
import adminmodel from "./model/admin.js";
import axios from "axios";
import multer from "multer";
import video from "./model/video.js";

const app = express();

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS middleware
app.use(
  cors({
    origin: ["https://kepapro.onrender.com","https://kepapro-back.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware to check for token in incoming requests
const checkToken = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET || "secret", (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err);
        res.clearCookie("token");
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

app.use("/",(res,req)=>{
  req.send("hey")
})

// Route to register a user
app.post("/register", async (req, res) => {
  try {
    const existingUser = await usermodel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await usermodel.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      age: req.body.age,
    });

    const token = jwt.sign({ email: req.body.email }, process.env.TOKEN_SECRET || "secret");
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: token });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route to create an admin
app.post("/createadmin", async (req, res) => {
  try {
    const existingAdmin = await adminmodel.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await adminmodel.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      age: req.body.age,
    });

    const token = jwt.sign({ email: req.body.email }, process.env.TOKEN_SECRET || "secret");
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle user login
app.post("/login", async (req, res) => {
  try {
    // Login logic for users
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle admin login
app.post("/adminlogin", async (req, res) => {
  try {
    // Login logic for admins
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route to add a link
app.post("/addlink", checkToken, async (req, res) => {
  try {
    // Add link logic
  } catch (error) {
    console.error("Error adding link:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get all data
app.get("/getall", async (req, res) => {
  try {
    // Get all data logic
  } catch (error) {
    console.error("Error getting all data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get data for watch page
app.get("/watchall", async (req, res) => {
  try {
    // Get data for watch page logic
  } catch (error) {
    console.error("Error getting data for watch page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to check the status
app.get("/listUploadedUrls", checkToken, async (req, res) => {
  try {
    // Check status logic
  } catch (error) {
    console.error("Error listing uploaded URLs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// Server port
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

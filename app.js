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
import fs from "fs";

const app = express();

// Set up session middleware
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set secure to false if not using HTTPS
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  const allowedOrigins = ["kepapro.onrender.com"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Max-Age", "7200");
  next();
});

app.use(
  cors({
    origin: ["kepapro.onrender.com", "kepapro-back.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const upload = multer({ dest: "uploads/" });

// Middleware to check for token in incoming requests
const checkToken = (req, res, next) => {
  const token = req.cookies.token; // Retrieve token from cookies
  if (token) {
    // Verify token
    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        // Token verification failed
        console.error("Token verification failed:", err);
        res.clearCookie("token"); // Clear invalid token
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        // Token is valid, attach user data to request for further processing
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
      }
    });
  } else {
    // Token is not present
    return res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/createuser", async (req, res, next) => {
  try {
    const existingUser = await usermodel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        const newUser = await usermodel.create({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          age: req.body.age,
        });
        const token = jwt.sign({ email: req.body.email }, "secret");
        res.cookie("token", token, {
          httpOnly: true,
        }); // Set cookie with httpOnly flag
        res.status(200).json({ message: "User created successfully" });
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/createadmin", async (req, res, next) => {
  try {
    const existingUser = await adminmodel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        const newadmin = await adminmodel.create({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          age: req.body.age,
        });
        const token = jwt.sign({ email: req.body.email }, "secret");
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // Set secure flag based on the environment
        }); // Set cookie with httpOnly flag
        res.status(200).json({ message: "User created successfully" });
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
      const token = jwt.sign({ email: req.body.email }, "secret");
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set secure flag based on the environment
      }); // Set cookie with httpOnly flag
      return res.json({
        success: true,
        user: {
          /* user data */
        },
      });
    } else {
      console.log("Incorrect password");
      return res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/adminlogin", async (req, res) => {
  try {
    const admin = await adminmodel.findOne({ email: req.body.email });
    if (!admin) {
      console.log("admin not found");
      return res.status(404).send("admin not found");
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      admin.password
    );
    if (passwordMatch) {
      const token = jwt.sign({ email: req.body.email }, "secret");
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set secure flag based on the environment
      }); // Set cookie with httpOnly flag
      return res.json({
        success: true,
        admin: {
          /* admin data */
        },
      });
    } else {
      console.log("Incorrect password");
      return res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/addlink", checkToken, async (req, res) => {
  try {
    const apiKey = "396272eryk12p9b7hdsjkc";
    const response =
      await axios.get(`https://doodapi.com/api/upload/url?key=${apiKey}&url=${req.body.link}
      `);
    const addlink = await video.create({
      videolink: req.body.link,
      season: req.body.season,
      ep: req.body.ep,
      discription: req.body.disc,
      genres: req.body.genric,
      animename: req.body.animename,
      thumnail: req.body.image,
      quality: req.body.quality,
    });
    res.send(response.data); // Send the response data from DoodStream directly
  } catch (error) {
    console.error("Error fetching DoodStream files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getall", async (req, res, next) => {
  try {
    const response = await video.find({ season: 1, ep: 1 });
    res.send(response);
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/watchall", async (req, res, next) => {
  try {
    const response = await video.find();
    res.send(response);
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/listUploadedUrls", checkToken, async (req, res) => {
  try {
    const apiKey = "396272eryk12p9b7hdsjkc"; // Replace 'your_api_key' with your actual API key
    const response = await axios.get(
      `https://doodapi.com/api/urlupload/list?key=${apiKey}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error listing uploaded URLs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

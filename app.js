import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import session from "express-session";
import cors from 'cors';
import usermodel from "./model/user.js";
import adminmodel from './model/admin.js'
import axios from "axios";
import multer from 'multer'
import video from './model/video.js'
import fs from 'fs'

const app = express();

app.set('https://kepapro.onrender.com', 1) // trust first proxy

// Set up session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    cookie: {secure: false} // Set secure to false if not using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ['https://kepapro.onrender.com', 'https://kepapro-back.onrender.com', "http://127.0.0.1:3000", "http://localhost:3000/"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

const upload = multer({ dest: 'uploads/' });

// Middleware to check for token in incoming requests
const checkToken = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, 'secret', (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err);
                res.clearCookie('token');
                return res.status(401).json({ error: 'Unauthorized' });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

app.get("/", (req, res) => {
    res.send("hello");
});

app.post("/register", async (req, res, next) => {
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
                res.cookie("token", token, { domain: "kepapro.onrender.com", path: "/", httpOnly: false, secure: false });
                res.send(token);
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
                res.cookie("token", token, { httpOnly: false, secure: false }); // Updated to false
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

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ email: req.body.email }, "secret");
            res.cookie("token", token, { httpOnly: false, secure: false }); // Updated to false
            return res.json({ success: true, user: { /* user data */ } });
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

        const passwordMatch = await bcrypt.compare(req.body.password, admin.password);
        if (passwordMatch) {
            const token = jwt.sign({ email: req.body.email }, "secret");
            res.cookie("token", token, { httpOnly: false, secure: false }); // Updated to false
            return res.json({ success: true, admin: { /* admin data */ } });
        } else {
            console.log("Incorrect password");
            return res.status(401).send("Incorrect password");
        }
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).send("Internal Server Error");
    }
});


app.post('/addlink', async (req, res) => {
    try {
        const { links, languages, season, ep, description, genres, thumnail, qualities, animename } = req.body;

        const videoDocuments = [];

        for (let i = 0; i < links.length; i++) {
            const newVideo = await video.create({
                videolink: links[i],
                language: languages[i],
                season,
                ep,
                description,
                genres,
                thumnail,
                quality: qualities[i],
                animename
            });

            videoDocuments.push(newVideo);
        }

        res.status(200).json({ message: 'Video details added successfully', videos: videoDocuments });
    } catch (error) {
        console.error('Error adding video details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


  app.get("/getall", async (req, res ,next) => {
    try {
      const response = await video.find({season:1,ep:1,quality:720});
      res.send(response);
        next();
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
  app.get("/watchall",async(req,res,next)=>{
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
        const apiKey = '396272eryk12p9b7hdsjkc'; // Replace 'your_api_key' with your actual API key
        const response = await axios.get(`https://doodapi.com/api/urlupload/list?key=${apiKey}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error listing uploaded URLs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/logout", (req, res) => {
    res.clearCookie("token"); 
    res.redirect("/");
});

const port = process.env.PORT || 4000;


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

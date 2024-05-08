import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import session from "express-session";
import cors from 'cors';
import usermodel from "./model/user.js";
import adminmodel from './model/admin.js';
import axios from "axios";
import multer from 'multer';
import video from './model/video.js';
import fs from 'fs';

const app = express();

// Session middleware configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to false for testing over HTTP
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'https://kepapro.onrender.com', // Replace with your React app's domain
    credentials: true, // Allow credentials (cookies)
    methods: ["GET", "POST", "PUT", "DELETE"]
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

// Routes for user and admin creation, login, etc.

// Route to add a video link
app.post('/addlink', checkToken, async (req, res) => {
    try {
        // Code to add a video link
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all videos
app.get("/getall", async (req, res, next) => {
    try {
        // Code to get all videos
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to watch all videos
app.get("/watchall", async (req, res, next) => {
    try {
        // Code to watch all videos
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to list uploaded URLs
app.get("/listUploadedUrls", checkToken, async (req, res) => {
    try {
        // Code to list uploaded URLs
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to logout
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

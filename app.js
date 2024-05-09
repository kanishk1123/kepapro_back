import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './model/user.js';
import session from "express-session"
import cors from 'cors';

const app = express();
const secretKey = 'your-secret-key';

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(
    cors({
      origin: ["kepapro.onrender.com", "kepapro-back.onrender.com"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/token", (req, res) => {
  const myVariable = req.session.myVariable;
  res.send(myVariable);
  res.cookie("token", myVariable);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.myVariable = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });

    res.cookie('jwt', req.session.myVariable, { httpOnly: true, maxAge: 3600000 });
    res.redirect('/token');
  });
});

app.post('/register', (req, res) => {
  const { username, email, password, passkey } = req.body;

  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({ username, email, password, passkey });
    newUser.save((err, savedUser) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to create user' });
      }

      req.session.myVariable = jwt.sign({ id: savedUser._id, username: savedUser.username }, secretKey, { expiresIn: '1h' });

      res.cookie('jwt', req.session.myVariable, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/token");
    });
  });
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

app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected data' });
});

function verifyToken(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(403).json({ message: 'Token not provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
}

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

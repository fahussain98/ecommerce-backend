import express from 'express'
import { User } from './component/schema.js';
import Product from './component/productschem.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import  cors from 'cors'
const app = express();
app.use(express.json())
app.use(cors())


mongoose
  .connect("mongodb://localhost:27017/ecom", {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

  const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }
  const bearerToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trimLeft() : token;
  jwt.verify(bearerToken, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(500).send({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};
app.post('/sign', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).send({ message: 'User already exists' });
    user = new User({username, email, password });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.send({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user', err);
    res.status(500).send({ message: 'Server error' });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.send({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ message: 'Server error' });
  }
});
// app.post("/sign", async (req, res) => {
//   try {
//     let user = new User(req.body);
//     let respon = await user.save();
//     res.send(respon);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// app.post("/login", async (req, res) => {
//   try {
//     if (!req.body.email || !req.body.password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     let user = await User.findOne({
//       email: req.body.email,
//       password: req.body.password,
//     }).select("-password");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
app.post("/add-product", async (req, res) => {
  try {
    let product = new Product(req.body);
    let userproduct = await product.save();
    res.json(userproduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/product", async (req, res) => {
  try {
    let respo = await Product.find();
    if (respo.length > 0) {
      res.json(respo);
    } else {
      res.json({ message: "No products found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;
    await Product.deleteOne({ _id: id });
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting product", error });
  }
});

app.listen(4000,()=>{
    console.log("your server is 4000");
})




const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const Contact = require("./models/contact");
const Product = require("./models/product");
const Company = require("./models/company");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
   
    "https://sowmyagorrepati.github.io",
    "http://localhost:5500", // 👈 Add this during local testing
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Barcode lookup route
app.get("/api/products/:barcode", async (req, res) => {
  try {
    const barcode = req.params.barcode;
    const product = await Product.findOne({
      barcode: { $regex: new RegExp(`^${barcode}$`) }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 🔍 Lookup company by `id` field in company collection
    const company = await Company.findOne({ id: parseInt(product.company) });

    const response = {
      ...product._doc,
      companyName: company ? company.name : "Unknown Company"
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// ✅ Contact form POST
app.post("/api/contact", async (req, res) => {
  try {
    console.log("Form data received:", req.body);
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (err) {
    console.error("Error submitting form:", err);
    res.status(500).json({ error: "Failed to submit form." });
  }
});

// ✅ Contact form GET
app.get("/api/contact", async (req, res) => {
  console.log("GET /api/contact was hit");
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts." });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

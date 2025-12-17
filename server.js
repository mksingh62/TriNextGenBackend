require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: ["https://tri-next-gen.vercel.app"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/contact", require("./routes/contact"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/careers", require("./routes/career"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/pages", require("./routes/pages"));
app.use("/api/admin", require("./routes/admin"));

app.get("/", (req, res) => {
  res.json({ status: "API running on Vercel" });
});

module.exports = app;

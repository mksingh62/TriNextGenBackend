require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

/* ================= MIDDLEWARE ================= */
// app.use(
//   cors({
//     origin: ["https://tri-next-gen.vercel.app"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: [
      "https://tri-next-gen.vercel.app",  // Production
      "http://localhost:3000",            // React dev server (if needed)
      "http://10.0.2.2:3000",             // Android emulator
      "http://127.0.0.1:3000",            // Localhost
      "http://localhost:5173",            // Vite dev server
      "http://10.0.2.2:5173",             // Android emulator for Vite
      "http://127.0.0.1:5173",            // Localhost for Vite
      // Add your local network IP if testing on physical device
      // "http://192.168.1.xxx:3000"     // Replace xxx with your IP
    ],
    credentials: true,
  })
);
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/contact", require("./routes/contact"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/careers", require("./routes/career"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/pages", require("./routes/pages"));
app.use("/api/admin", require("./routes/admin"));

/* 🔥 CLIENT ROUTES (SINGLE SOURCE OF TRUTH) */
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/clientProject", require("./routes/clientProjectRoutes"));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "API running on Vercel" });
});

module.exports = app;

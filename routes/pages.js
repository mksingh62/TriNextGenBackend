const express = require("express");
const router = express.Router();

// In-memory page data. For a real app, use a database.
const pages = {
  services: {
    badge: "Our Services",
    title: "Comprehensive Software Solutions",
    description: "From concept to deployment, we offer end-to-end software development services that drive innovation and deliver measurable results for your business.",
    cta: {
      title: "Ready to Transform Your Business?",
      description: "Let's discuss your project requirements and create a custom solution that drives your business forward.",
      button1_text: "Start Your Project",
      button2_text: "Schedule Consultation"
    }
  }
  // Other pages like home, about, contact can be added here
};

// API endpoint: /api/pages/services
router.get("/:page", (req, res) => {
  const page = req.params.page.toLowerCase();
  if (pages[page]) {
    return res.json(pages[page]);
  }
  return res.status(404).json({ error: "Page not found" });
});

module.exports = router;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Service = require("./models/service.js");
const Career = require("./models/Career.js");

dotenv.config();

const services = [
  {
    title: "Web Development",
    description: "Custom web applications built with modern frameworks and technologies for optimal performance and scalability.",
    features: ["React/Next.js", "Node.js Backend", "Responsive Design", "API Integration"],
    icon: "Code",
    color: "from-blue-500 to-purple-600"
  },
  {
    title: "Mobile Development",
    description: "Native and cross-platform mobile apps that deliver exceptional user experiences across all devices.",
    features: ["React Native", "iOS/Android", "App Store Deploy", "Push Notifications"],
    icon: "Smartphone",
    color: "from-purple-500 to-pink-600"
  },
  {
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure and migration services to optimize your business operations and reduce costs.",
    features: ["AWS/Azure/GCP", "DevOps Setup", "Auto Scaling", "Security First"],
    icon: "Cloud",
    color: "from-green-500 to-blue-600"
  },
  {
    title: "Data Analytics",
    description: "Transform your data into actionable insights with advanced analytics and business intelligence solutions.",
    features: ["Data Visualization", "ML Models", "Real-time Analytics", "Custom Dashboards"],
    icon: "Database",
    color: "from-orange-500 to-red-600"
  },
  {
    title: "Cybersecurity",
    description: "Comprehensive security solutions to protect your digital assets and ensure compliance with industry standards.",
    features: ["Security Audits", "Penetration Testing", "Compliance", "24/7 Monitoring"],
    icon: "Shield",
    color: "from-red-500 to-purple-600"
  },
  {
    title: "Digital Transformation",
    description: "End-to-end digital transformation services to modernize your business processes and technology stack.",
    features: ["Process Automation", "Legacy Migration", "Training & Support", "Change Management"],
    icon: "Zap",
    color: "from-yellow-500 to-orange-600"
  }
];

const careers = [
  {
    title: 'Senior Frontend Engineer (React + TypeScript)',
    location: 'Remote',
    type: 'Full-time',
    level: 'Senior',
    salary: '$120k – $160k',
    tags: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    description: 'Lead UI development, build high-quality components, and collaborate with design to craft exceptional experiences.'
  },
  {
    title: 'Backend Engineer (Node/TS)',
    location: 'Bengaluru, IN',
    type: 'Full-time',
    level: 'Mid',
    salary: '$90k – $130k',
    tags: ['Node.js', 'PostgreSQL', 'REST', 'Cloud'],
    description: 'Build scalable APIs and services with robust testing and monitoring.'
  },
  {
    title: 'AI/ML Engineer',
    location: 'Hybrid - Pune, IN',
    type: 'Full-time',
    level: 'Mid',
    salary: '₹25L – ₹45L',
    tags: ['Python', 'LLMs', 'Vector DBs', 'RAG'],
    description: 'Prototype and productionize AI features with measurable business impact.'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB. Seeding...");
    await Service.deleteMany({});
    await Service.insertMany(services);
    await Career.deleteMany({});
    await Career.insertMany(careers);
    console.log("✅ Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
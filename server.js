
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./database");

const app = express();
// Request Logging Middleware
app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} - ${req.method} ${req.url}`
    );
    next();
});
const PORT = 3000;

// Security headers
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));
// Validate internship details
function validateInternship(body) {
  const fields = ["title", "company", "location", "type"];

  for (const field of fields) {
    if (
      typeof body[field] !== "string" ||
      !body[field].trim() ||
      body[field].trim().length > 150
    ) {
      return `${field} is required and must be under 150 characters`;
    }
  }

  return null;
}

// GET: List internships
app.get("/api/internships", (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      error: "Invalid page or limit"
    });
  }

  const data = db.prepare(
    "SELECT * FROM internships LIMIT ? OFFSET ?"
  ).all(limit, (page - 1) * limit);

  const total = db.prepare(
    "SELECT COUNT(*) AS total FROM internships"
  ).get().total;

  res.json({
    data,
    pagination: { page, limit, total }
  });
});

// GET: One internship
app.get("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: "Invalid ID"
    });
  }

  const item = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(id);

  if (!item) {
    return res.status(404).json({
      error: "Internship not found"
    });
  }

  res.json({ data: item });
});

// POST: Create internship
app.post("/api/internships", (req, res) => {
  const error = validateInternship(req.body || {});

  if (error) {
    return res.status(400).json({ error });
  }

  const result = db.prepare(`
    INSERT INTO internships (title, company, location, type)
    VALUES (?, ?, ?, ?)
  `).run(
    req.body.title.trim(),
    req.body.company.trim(),
    req.body.location.trim(),
    req.body.type.trim()
  );

  const item = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(result.lastInsertRowid);

  res.status(201).json({ data: item });
});

// PUT: Update internship
app.put("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: "Invalid ID"
    });
  }

  const existing = db.prepare(
    "SELECT id FROM internships WHERE id = ?"
  ).get(id);

  if (!existing) {
    return res.status(404).json({
      error: "Internship not found"
    });
  }

  const error = validateInternship(req.body || {});

  if (error) {
    return res.status(400).json({ error });
  }

  db.prepare(`
    UPDATE internships
    SET title = ?, company = ?, location = ?, type = ?
    WHERE id = ?
  `).run(
    req.body.title.trim(),
    req.body.company.trim(),
    req.body.location.trim(),
    req.body.type.trim(),
    id
  );

  const item = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(id);

  res.json({ data: item });
});

// DELETE: Internship
app.delete("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: "Invalid ID"
    });
  }

  const result = db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Internship not found"
    });
  }

  res.status(204).send();
});
// POST: Submit application
console.log("Applications route registered");
// POST: Submit application
app.post("/api/applications", (req, res) => {
  const body = req.body || {};

  const {
    internship_id,
    applicant_name,
    email,
    phone,
    resume_link
  } = body;

  if (
    !Number.isInteger(internship_id) ||
    internship_id < 1 ||
    typeof applicant_name !== "string" ||
    applicant_name.trim().length < 2 ||
    applicant_name.trim().length > 100 ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof phone !== "string" ||
    !/^[0-9]{10}$/.test(phone.trim()) ||
    typeof resume_link !== "string" ||
    resume_link.length > 2048 ||
    !/^https?:\/\/\S+$/i.test(resume_link.trim())
  ) {
    return res.status(400).json({
      error: "Enter a valid internship ID, name, email, 10-digit phone, and resume URL"
    });
  }

  const internship = db.prepare(
    "SELECT id FROM internships WHERE id = ?"
  ).get(internship_id);

  if (!internship) {
    return res.status(404).json({
      error: "Internship not found"
    });
  }

  const result = db.prepare(`
    INSERT INTO applications
      (internship_id, applicant_name, email, phone, resume_link)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    internship_id,
    applicant_name.trim(),
    email.trim(),
    phone.trim(),
    resume_link.trim()
  );

  res.status(201).json({
    message: "Application submitted successfully",
    application_id: Number(result.lastInsertRowid)
  });
});

// Invalid JSON handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: "Invalid JSON body"
    });
  }

  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  res.status(500).json({
    error: "Internal server error"
  });
});
app.get("/debug-routes", (req, res) => {
  res.json({
    applicationsRouteExists: true,
    message: "Debug endpoint is working"
  });
});
// Health Check API
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Internship API is healthy",
        timestamp: new Date().toISOString()
    });
});
// Start server
app.listen(PORT, () => {
  console.log(
    `Internship API running at http://localhost:${PORT}`
  );
});

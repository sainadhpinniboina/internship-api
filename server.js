
const express = require("express");
const db = require("./database");

const app = express();
app.use(express.json());

const fields = ["title", "company", "location", "type"];

function validate(body) {
  for (const field of fields) {
    if (
      typeof body[field] !== "string" ||
      !body[field].trim()
    ) {
      return `${field} is required`;
    }
  }
  return null;
}

// List with pagination
app.get("/api/internships", (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  if (
    !Number.isInteger(page) || page < 1 ||
    !Number.isInteger(limit) || limit < 1 || limit > 100
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

// Get one internship
app.get("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const item = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(id);

  if (!item) {
    return res.status(404).json({ error: "Internship not found" });
  }

  res.json({ data: item });
});

// Create
app.post("/api/internships", (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });

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

// Update
app.put("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const existing = db.prepare(
    "SELECT id FROM internships WHERE id = ?"
  ).get(id);

  if (!existing) {
    return res.status(404).json({ error: "Internship not found" });
  }

  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });

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

  res.json({
    data: db.prepare(
      "SELECT * FROM internships WHERE id = ?"
    ).get(id)
  });
});

// Delete
app.delete("/api/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const result = db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Internship not found" });
  }

  res.status(204).send();
});

// Handle malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next(err);
});

app.listen(3000, () => {
  console.log("Internship API running at http://localhost:3000");
});


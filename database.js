
const Database = require("better-sqlite3");

const db = new Database("internships.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    resume_link TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id)
      REFERENCES internships(id)
  );
`);
const count = db.prepare(
  "SELECT COUNT(*) AS total FROM internships"
).get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO internships (title, company, location, type)
    VALUES (?, ?, ?, ?)
  `);

  insert.run(
    "Full Stack Developer Intern",
    "Tech Solutions",
    "Remote",
    "Internship"
  );

  insert.run(
    "Web Development Intern",
    "WebWorks",
    "Hyderabad",
    "Internship"
  );
}

module.exports = db;

const db = require("./database");

const insert = db.prepare(`
  INSERT INTO internships (title, company, location, type)
  VALUES (?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  const count = db.prepare(
    "SELECT COUNT(*) AS total FROM internships"
  ).get().total;

  if (count === 0) {
    insert.run(
      "Frontend Developer Intern",
      "Creative Labs",
      "Remote",
      "Internship"
    );

    insert.run(
      "Backend Developer Intern",
      "CodeWorks",
      "Chennai",
      "Internship"
    );
  }
});

seed();
console.log("Seed data ready!");
db.close();
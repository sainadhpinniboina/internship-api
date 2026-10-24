
# Internship API

A beginner-friendly REST API built with Node.js, Express and SQLite.

## Requirements
- Node.js
- npm

## Setup

```bash
npm install
node server.js
```

The API runs at http://localhost:3000.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/internships | List internships |
| GET | /api/internships/:id | Get one internship |
| POST | /api/internships | Create internship |
| PUT | /api/internships/:id | Update internship |
| DELETE | /api/internships/:id | Delete internship |

## Pagination

GET /api/internships?page=1&limit=10

## Example request body

```json
{
  "title": "Frontend Developer Intern",
  "company": "Creative Labs",
  "location": "Remote",
  "type": "Internship"
}
```

## Status codes
- 200: Success
- 201: Created
- 204: Deleted
- 400: Invalid input
- 404: Internship not found

## Database
SQLite stores internship records persistently in internships.db.
Parameterized SQL queries are used for database operations.

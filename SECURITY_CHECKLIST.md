# Security Checklist — Internship API

## 1. Secure HTTP Headers
- [x] Helmet middleware enabled
- [x] Content-Security-Policy header present
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: SAMEORIGIN

## 2. Rate Limiting
- [x] API rate limiter configured
- [x] Limit: 100 requests per 15 minutes
- [x] Excess requests receive a rate-limit error

## 3. Input Validation
- [x] Applicant name validated
- [x] Email format validated
- [x] Phone number validated
- [x] Resume URL validated
- [x] Internship ID validated
- [x] Internship existence checked before saving an application

## 4. Database Security
- [x] Parameterized SQL queries used in application routes
- [x] Application data stored in SQLite
- [ ] SQL injection protection tested separately

## 5. Error Handling
- [x] Invalid JSON handled
- [x] Validation errors returned to the client
- [x] General server errors handled

## 6. Final Review
- [ ] Frontend loading and error states verified
- [ ] All tests documented
- [ ] Public GitHub repository checked

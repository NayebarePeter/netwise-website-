NETWISE Subscription Server

This small Express server accepts subscription requests and sends a confirmation email to the subscriber using SMTP (via Nodemailer).

Setup

1. Copy `.env.example` to `.env` and fill in your SMTP credentials and emails.

2. Install dependencies:

```bash
cd server
npm install
```

3. Run the server:

```bash
npm start
```

Development (auto-restart):

```bash
npm run dev
```

Endpoint

POST /api/subscribe
Content-Type: application/json
Body: { "email": "subscriber@example.com" }

Response: 200 on success, 400 for validation errors, 500 for server errors.

Notes

- Make sure your SMTP credentials allow sending from the configured `FROM_EMAIL`.
- For production, consider using a transactional email provider (SendGrid, Mailgun) and secure environment management.

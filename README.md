# KING'S FITNESS Website

Full-stack website for **KING'S FITNESS** – a gym service provider offering AMC, repairs, complete gym setups and manpower supply.

## Features

- **Public website**
  - Modern dark UI themed for gyms with KING'S FITNESS red branding.
  - Sections for services, AMC & repairs, manpower, media/projects and contact.
  - Direct actions:
    - **Call** primary number `+91-8850081223` and owner `+91-9321859324`.
    - **WhatsApp** chat links for both numbers.
    - **Email** (primary) `rajsakpal4@gmail.com` and (secondary) `harshsakpal1227@gmail.com`.
  - Contact form that POSTs to backend (`/api/contact`).
  - Public media section that loads videos/images configured from admin panel.
  - Embedded **gym assistant chatbot** for FAQs related to equipment, AMC, setups, apps and manpower.

- **Backend (Node + Express)**
  - Serves static frontend from `public/`.
  - `POST /api/contact` – logs enquiries and can email details via SMTP (if configured).
  - `POST /api/auth/login` – simple admin login (username/password from environment variables).
  - `GET /api/content` / `POST /api/content` – read and update media content stored in `data/content.json`.
  - `POST /api/bill/pdf` – generates professional **PDF bills/quotations** using `pdfkit` and streams to browser.

- **Admin dashboard**
  - Protected login (JWT-based) with configurable credentials.
  - Overview metrics for quick status.
  - **Media tab**:
    - Add YouTube video URLs and image URLs plus highlight text.
    - Saves into `data/content.json` and shows on the public site.
  - **Billing tab**:
    - Build invoices or quotations with:
      - Client details.
      - Dynamic line items (description, qty, rate, auto amount).
      - Auto subtotal and total calculation.
      - Optional notes (terms, warranty, comments).
    - Generates a clean **PDF invoice or quotation** matching KING'S FITNESS branding.

## Local setup

1. **Install Node.js and npm** (if not already)
   - Download from the official Node.js website and install (LTS version is fine).

2. **Install dependencies**

   ```bash
   cd "c:\Users\Harsh Sakpal\Desktop\kings fitness web"
   npm install
   ```

3. **Configure environment**

   - Copy `.env.example` to `.env` and adjust:

   ```bash
   cp .env.example .env
   ```

   - Important variables:
     - `PRIMARY_EMAIL` – main notification email (default: `rajsakpal4@gmail.com`).
     - `SECONDARY_EMAIL` – secondary (default: `harshsakpal1227@gmail.com`).
     - `ADMIN_USER` / `ADMIN_PASS` – admin login for dashboard.
     - `JWT_SECRET` – change to a strong random string.
     - **SMTP settings (optional but recommended)**:
       - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` for any free/paid email provider (for example Gmail app-password or services like Resend/Brevo etc.).

4. **Run the server**

   ```bash
   npm start
   ```

   - Open `http://localhost:4000` in your browser for the public site.
   - Open `http://localhost:4000/admin.html` for the admin dashboard.

## Free hosting suggestion

You can host this app for free (subject to provider limits) on platforms like:

- **Render** (Node web service)
- **Railway**
- **Fly.io**

Generic steps (for example, Render):

1. Create a **GitHub repository** and push this folder.
2. On Render:
   - Create a new **Web Service**.
   - Connect to your GitHub repo.
   - Set:
     - **Build command**: `npm install`
     - **Start command**: `npm start`
   - Add environment variables in Render dashboard (same as your `.env` local file).
3. Deploy. Render will give you a public URL like `https://kings-fitness.onrender.com`.

## Email and WhatsApp behaviour

- **Email**
  - Contact form always shows `mailto:` links so visitors can email directly.
  - If SMTP settings are configured, `/api/contact` will also send an email to `PRIMARY_EMAIL` and `SECONDARY_EMAIL` with enquiry details.

- **WhatsApp**
  - Website uses official `wa.me` links:
    - Primary: `https://wa.me/918850081223?...`
    - Owner: `https://wa.me/919321859324?...`
  - Browser cannot auto-send WhatsApp messages without user action, but one click will open chat with your number and pre-filled text.

## Security notes

- **Change admin password** in `.env` before going live.
- Keep `.env` out of version control (do not commit it).
- If you add more advanced features (for example, saving client data), consider using a database (PostgreSQL, MongoDB etc.) and HTTPS on hosting.


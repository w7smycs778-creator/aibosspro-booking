# AIBOSSPRO — Booking Page

Mobile-first consultation booking page for AIBOSSPRO services.
Hebrew / RTL. Dark theme. Google Calendar backend + WhatsApp webhook.

## Quick start

```bash
cd laser-booking
cp .env.example .env      # fill in the values (see below)
npm install
npm run dev               # starts Vite (port 5173) + Express API (port 3001)
```

Open http://localhost:5173

---

## Google Calendar Setup

Follow these steps exactly to connect the booking form to your Google Calendar.

### Step 1 — Go to Google Cloud Console

Open https://console.cloud.google.com and sign in with your Google account.

### Step 2 — Create a project

1. Click the project selector at the top → **New Project**
2. Give it a name (e.g. `aibosspro-booking`) and click **Create**
3. Make sure the new project is selected in the top bar

### Step 3 — Enable Google Calendar API

1. In the left menu go to **APIs & Services → Library**
2. Search for **Google Calendar API**
3. Click it and press **Enable**

### Step 4 — Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → Service Account**
3. Name it (e.g. `booking-agent`) and click **Done**
4. Click the new service account in the list to open it

### Step 5 — Download the JSON key

1. Inside the service account, go to the **Keys** tab
2. Click **Add Key → Create new key → JSON**
3. A `.json` file downloads — keep it safe, never commit it to git

### Step 6 — Share your Google Calendar with the service account

1. Open https://calendar.google.com
2. In the left sidebar, hover over the calendar you want to use → click the three dots → **Settings and sharing**
3. Under **Share with specific people**, click **+ Add people**
4. Enter the service account email (found in the JSON file as `client_email`, e.g. `booking-agent@aibosspro-booking.iam.gserviceaccount.com`)
5. Set permission to **Make changes to events** → click **Send**
6. Also copy the **Calendar ID** from the "Integrate calendar" section — it looks like `abc123@group.calendar.google.com` or `you@gmail.com`

### Step 7 — Add credentials to .env

Stringify the JSON key file into a single line:

```bash
cat service-account.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))"
```

Then open `.env` and fill in:

```
GOOGLE_SERVICE_ACCOUNT_JSON=<paste the single-line JSON here>
GOOGLE_CALENDAR_EMAIL=booking-agent@aibosspro-booking.iam.gserviceaccount.com
CALENDAR_ID=<your calendar ID>
```

---

## WhatsApp Webhook

Set `WHATSAPP_WEBHOOK_URL` to a POST endpoint that receives booking data and sends a WhatsApp confirmation.

Payload on every successful booking:
```json
{
  "clientName": "ישראל ישראלי",
  "clientPhone": "0501234567",
  "treatment": "whatsapp-ai",
  "date": "2025-06-15",
  "time": "10:00"
}
```

If you're using n8n, create a Webhook node set to POST and paste its URL here.
Leave empty to skip — the booking still completes, only the WhatsApp message is skipped.

---

## Architecture

```
laser-booking/
├── server/index.js        Express API (port 3001)
│   GET  /api/availability?date=   → available slots from Google Calendar
│   POST /api/book                 → insert event + fire WhatsApp webhook
├── src/
│   ├── App.jsx            Root — header, form card, success screen
│   └── components/
│       ├── BookingForm.jsx    Form state + submit logic
│       ├── DatePicker.jsx     Custom Hebrew RTL calendar (no Saturdays)
│       ├── TimeSlotPicker.jsx Grid of available hours
│       └── SuccessScreen.jsx  Booking confirmation summary
```

Vite proxies all `/api/*` requests to `localhost:3001` during development.
For production, deploy the Express server separately and configure your reverse proxy.

---

## Services (treatment values)

| Value | Hebrew label |
|---|---|
| `whatsapp-ai` | מערכת WhatsApp AI |
| `website-ai` | אתר אינטרנט עם AI |
| `automation` | אוטומציה עסקית |
| `full-package` | חבילה מלאה |

## Time slots

`09:00 10:00 11:00 12:00 14:00 15:00 16:00 17:00 18:00 19:00`

Configured in `server/index.js` → `ALL_SLOTS`. Booked slots are filtered out by checking Google Calendar.

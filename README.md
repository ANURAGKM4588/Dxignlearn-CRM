# Dxign CRM — Minimal & Modern CRM with 100% Free WhatsApp & Instagram Automation

Dxign CRM is a sleek, modern, minimal CRM application designed specifically for agencies, studios, founders, and sales teams who need lead management, automated follow-ups, and omnichannel messaging with **zero paid extensions, zero subscription fees, and zero API markups**.

---

## 🌟 Key Features

1. **Overview Dashboard**
   - Live KPI cards: Total Leads, Pipeline Value, Conversion Rate, Follow-ups Due, Auto-replies Fired.
   - Interactive Pipeline Distribution Bar.
   - Urgent Follow-ups Due Today widget with 1-click WhatsApp messaging.
   - Real-time live activity stream.
   - Zero-dependency modern canvas charts (lead source donut and conversion velocity).

2. **Lead & Pipeline Management**
   - **Kanban Board**: Drag-and-drop leads across pipeline stages (*New Leads*, *Contacted*, *Meeting/Demo*, *Proposal Sent*, *Follow-up Needed*, *Closed Won*).
   - **Filterable Table View**: Search by name, company, or contact info; filter by stage, priority (Hot, Warm, Cold), and acquisition source.
   - **Slide-over Lead Drawer**: Complete contact profile, deal value, internal notes with instant saving, and chronological activity/message timeline.
   - **New Lead Modal**: Rapid lead creation with priority tagging and source attribution.

3. **Automated Follow-ups Engine**
   - **Sequence Rules**: Automated trigger conditions (e.g. 24h Post-Proposal check-in, Dormant lead re-activator) with configurable delay hours and toggle switches.
   - **Follow-up Queue**: Prioritized list highlighting overdue or due follow-ups.
   - **1-Click WhatsApp Follow-up**: Launch personalized messages using dynamic templates (`{{name}}`, `{{company}}`, `{{deal_value}}`) directly into WhatsApp Web or Desktop app.
   - **Template Manager**: Ready-to-use high-converting templates with single-click copy and variable preview.

4. **WhatsApp & Instagram Automation Hub (100% Free)**
   - **Auto-Reply Rules Engine**: Define keyword triggers (e.g., *pricing*, *demo*, *quote*, *hello*) with automated actions (Auto-create lead, apply tag, log activity).
   - **Interactive Live Customer Phone Simulator**:
     - Toggle between **WhatsApp Mode** (emerald green) and **Instagram DM Mode** (Instagram gradient).
     - Type any incoming message into the simulated phone.
     - Tests the auto-reply engine in real time with typing indicator, produces the automated reply, and automatically registers the new prospect as a Lead in the CRM pipeline!
   - **Free Setup Guides**: Step-by-step instructions for WhatsApp Web QR Bridge, Meta Free Tier (1,000 monthly free conversations), and Direct Click-to-Chat deep links.

5. **Universal Search & Fast Shortcuts**
   - Global Quick Search modal (`Ctrl+K` or `Cmd+K`) to jump directly to any lead.
   - Built-in subtle Web Audio API chimes for auto-reply and stage updates.

6. **Local Storage & Backup**
   - Persistent client-side storage with zero hosting costs.
   - Single-click Complete JSON Backup Export & Restore.

---

## 🚀 How to Run Dxign CRM

### Option 1: Direct Browser Launch
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox, Safari).

### Option 2: Local HTTP Server (e.g. Python or VS Code Live Server)
If you have Python installed:
```powershell
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

---

## 📱 100% Free WhatsApp & Instagram Possibilities Reviewed

| Method | Platform | Cost | How It Operates |
| :--- | :--- | :--- | :--- |
| **WhatsApp Web QR Bridge** (`whatsapp-bridge.js`) | WhatsApp | **$0.00 Forever** | Uses open-source Baileys protocol. Scan QR code on your phone (`Linked Devices`). Runs 24/7 auto-replies with no API bans or fees. |
| **Meta Official Cloud API (Free Tier)** | WhatsApp | **Free (1,000 convos/mo)** | Meta provides 1,000 free service conversations per month without paying BSP markups. Direct webhook connection. |
| **Instagram Messenger API (Developer Tier)** | Instagram | **$0.00** | Available for any Instagram Professional account connected to a Facebook Page. Free webhooks for direct messages. |
| **Direct Deep-Link URLs** (`wa.me` & `ig.me`) | Both | **$0.00 Forever** | Zero setup required. Generates personalized follow-ups with CRM variables and launches WhatsApp or Instagram with 1 click. |

---

## 📂 File Architecture
```
Dxign CRM/
├── index.html                 # Single page application structure
├── css/
│   └── styles.css             # Minimalist luxury dark/light design system
├── js/
│   ├── app.js                 # App controller, navigation, shortcuts & audio
│   ├── data.js                # State store, seed leads, templates & localStorage
│   ├── leads.js               # Kanban drag & drop, table view, drawer & lead CRUD
│   ├── followups.js           # Auto follow-up rules, sequence queue & templates
│   ├── omnichannel.js         # Auto-reply engine, live phone simulator & tabs
│   └── analytics.js           # Canvas charts & KPI computations
├── whatsapp-bridge.js         # Companion standalone Node.js WhatsApp QR bot
└── README.md                  # Comprehensive documentation
```

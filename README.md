# Field Service POS

Offline-first iPad app for foundation repair technicians. Handles spotty connectivity, syncs when possible, integrates with Salesforce.

## Why offline-first

Technicians work in basements with no signal. App must work without it.

## Architecture
iPad (SQLite) → Queue → Azure Functions → PostgreSQL → Salesforce
↑___________________________↓
(sync when online)

## Key features

- **Visit workflows:** Step-by-step job documentation
- **Photo/video capture:** Stored locally, upload on connection
- **Contract PDFs:** Generated offline, e-signed, synced later
- **Salesforce sync:** Background queue with conflict resolution

## Hard parts

- Conflict resolution when two techs edit same customer record
- Photo/video upload resumption after connection drops
- PDF generation and e-signature capture offline
- Google Workspace SSO with role-based access

## Tech stack

- **Mobile:** React Native / Expo
- **Backend:** Azure Functions, Python, FastAPI
- **Database:** PostgreSQL (Azure)
- **Storage:** Cloudflare R2 (media), Azure Blob (backups)
- **Auth:** Google Workspace SSO
- **CRM:** Salesforce API integration
- **CI/CD:** GitHub Actions, Expo EAS

## Project structure
mobile/
├── App.js                   # Main app, sync logic
├── screens/
│   ├── HomeScreen.js
│   ├── VisitScreen.js
│   └── ContractScreen.js
└── package.json
backend/
├── api/
│   └── routes.py            # REST endpoints
├── sync/
│   └── offline_queue.py     # Conflict resolution
└── requirements.txt
infrastructure/
└── azure/
└── terraform.tf         # All Azure resources

## Run locally

```bash
# Mobile
cd mobile
npm install
npx expo start

# Backend
cd backend
pip install -r requirements.txt
uvicorn api.routes:app --reload

# AutoSense

AutoSense is an AI-powered predictive maintenance platform for EVs, normal cars, and heavy truck engines. It combines a modern React dashboard, independent machine learning inference APIs for each vehicle type, and an in-app assistant called AutoPilot to help users monitor fleet health, estimate remaining useful life, and make faster maintenance decisions.

## What This Project Is Used For

- Predict EV/normal-car component risk and Remaining Useful Life (RUL).
- Predict heavy truck engine risk classes using temporal deep learning.
- Provide fleet analytics and history views for operations teams.
- Offer in-app product help through AutoPilot AI chatbot (FAQ/app guidance only).
- Support authenticated workflows for company or fleet users.

## Core Capabilities

- EV/normal-car prediction endpoint with risk label and confidence.
- Truck engine prediction endpoint with class probabilities.
- Secure JWT auth (signup, login, profile).
- Interactive frontend with protected routes.
- Startup model warmup and model health checks.
- Context-aware AI assistant integrated into the UI for simple product FAQs only.

## Tech Stack

### Frontend

- React 18
- Vite 5
- React Router v6
- Tailwind CSS
- Framer Motion
- Recharts
- Axios / Fetch
- React Hook Form
- Zustand

### Backend

- FastAPI
- Beanie + Motor + MongoDB
- PyTorch (truck model)
- Scikit-learn, XGBoost, LightGBM, CatBoost (EV pipeline)
- Python-JOSE (JWT)
- Bcrypt
- Httpx

## Project Structure

```text
AutoSense/
├── src/
│   ├── components/
│   │   ├── AIChatbot.jsx
│   │   ├── AutoSenseHero.jsx
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Homepage.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EVPrediction.jsx
│   │   ├── TruckPrediction.jsx
│   │   ├── History.jsx
│   │   └── Analytics.jsx
│   ├── utils/
│   │   ├── api.js
│   │   └── keepAlive.js
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py
│   │   ├── predict.py
│   │   ├── predict_truck.py
│   │   └── chatbot.py
│   ├── models/
│   │   └── user.py
│   ├── schemas/
│   │   └── auth.py
│   ├── utils/
│   │   ├── auth.py
│   │   └── jwt.py
│   └── Truck_Models/
│       ├── best_hybrid_lambda_009.pt
│       ├── best_temporal_model.pt
│       └── scania_inference.py
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Application Routes (Frontend)

- Public pages:
  - `/`
  - `/login`
  - `/signup`
  - `/forgot-password`
- Protected pages:
  - `/dashboard`
  - `/history`
  - `/analytics`
  - `/predict/:carId` (EV prediction)
  - `/predict/truck/:truckId` (truck prediction)

## API Endpoints (Backend)

### Health

- `GET /` -> API running check
- `GET /health/models` -> EV and truck warmup/load status

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)

### EV Prediction

- `POST /predict/ev` (Bearer token)
- `GET /predict/ev/status`

### Truck Prediction

- `POST /predict/truck` (Bearer token)
- `GET /predict/truck/status` (Bearer token)

### AutoPilot AI Bot

- `POST /ai/chat`

## AutoPilot AI Bot (Integrated Assistant)

AutoPilot is the in-app AI helper integrated into the frontend and backed by Gemini through FastAPI.

AutoPilot is not part of the prediction pipeline and never performs or influences EV/normal-car/truck model inference.

### What AutoPilot Does

- Answers simple user FAQs about AutoSense.
- Explains app workflows and navigation.
- Helps users with app-related questions only.
- Responds with short, practical product-focused guidance.

### Where It Is Integrated

- Frontend widget component: `src/components/AIChatbot.jsx`
- API client function: `src/utils/api.js` (`askAIChatbot`)
- Backend AI route: `backend/routes/chatbot.py`
- Mounted globally in app shell via `src/App.jsx`

### AutoPilot Request/Response Contract

Request (`POST /ai/chat`):

```json
{
  "message": "How does AutoSense work?",
  "history": [
    { "role": "user", "text": "What is AutoSense?" },
    { "role": "assistant", "text": "..." }
  ]
}
```

Response:

```json
{
  "answer": "AutoSense predicts maintenance risk for EVs and trucks. Use dashboard, prediction pages, and analytics to monitor fleet health."
}
```

### AutoPilot Behavior Notes

- Injects project context and README excerpt into prompt for grounded answers.
- Keeps responses concise (target 1-2 short sentences).
- Uses Gemini model fallback targets if configured model is unavailable.
- If Gemini API key is missing, returns `503` with configuration error.
- Does not call EV or truck prediction routes and is never used for prediction output.

### AutoPilot UI Notes

- Floating help button with text: "Need help? Ask AutoPilot"
- Quick prompts included in widget:
  - What is AutoSense?
  - How does AutoSense work?
  - How do EV and truck predictions differ?
- Supports global open event:
  - `window.dispatchEvent(new Event('open-autopilot-chat'))`

## Environment Variables

Create root `.env` (frontend):

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Create `backend/.env`:

```env
MONGO_URI=your_mongo_uri
DB_NAME=AutoSense
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta
```

## Local Setup

### 1) Frontend Setup

```bash
npm install
npm run dev
```

Default Vite dev URL is usually `http://localhost:5173` (unless configured otherwise).

### 2) Backend Setup

From `backend/`:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3) Access App

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## How To Use AutoSense

1. Sign up or log in.
2. Open Dashboard to view overall fleet status.
3. Run EV prediction from EV route with required sensor features.
4. Run Truck prediction with feature vector input.
5. Review History and Analytics for trends.
6. Use AutoPilot for in-app guidance and page-level help.

## Model and Data Requirements

The ML models are independent per vehicle type. EV/normal-car prediction and heavy-truck prediction run on separate model artifacts and separate inference logic.

### EV Artifacts

The EV route expects artifacts under `backend/models/`:

- `scaler.pkl`
- `best_classifier.pkl`
- `best_regressor.pkl`
- `config.pkl`

### Truck Artifacts

The truck route expects artifacts under `backend/Truck_Models/`:

- `best_hybrid_lambda_009.pt` (preferred)
- `best_temporal_model.pt` (fallback)
- `scaler_truck.pkl`
- `feature_columns.pkl`

## Security and Auth Notes

- Protected prediction endpoints require `Authorization: Bearer <token>`.
- Frontend API helper auto-attaches token from localStorage for protected requests.
- On `401`, frontend clears token and redirects to login.

## Troubleshooting

### Backend starts but predictions fail

- Verify required model artifact files are present in expected folders.
- Check `GET /health/models` for warmup status and error details.

### AutoPilot returns configuration error

- Ensure `GEMINI_API_KEY` is set in `backend/.env`.
- Restart backend after environment changes.

### CORS issue in browser

- Confirm frontend origin is listed in backend CORS config (`backend/main.py`).

### Unauthorized on prediction APIs

- Log in again and confirm Bearer token is present in request headers.

## Production Notes

- Build frontend with:

```bash
npm run build
npm run preview
```

- Set secure secrets and DB URI in production environment.
- Keep model artifact files available on deployment target.
- Restrict CORS to trusted frontend domains.

## Future Improvements

- Add rate limiting and guardrails for AutoPilot endpoint.
- Persist chat sessions/history to backend.
- Add role-based access and audit logs.
- Add unit/integration tests for API routes and chatbot behavior.

## License

MIT

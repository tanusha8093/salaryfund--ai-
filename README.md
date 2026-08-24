# SalaryFund AI — EWA & AI-Powered Lending Platform
  hello iam veda   hhhhhhiiiii  how are you
  helo iam swathi
  hello iam tanusha
SalaryFund AI is an enterprise-grade fintech platform for Earned Wage Access (EWA) and AI-powered lending. The project features a robust **FastAPI backend** running machine learning subsystems and a beautiful, modern **React frontend** built with Vite, Tailwind CSS, and shadcn/ui.

This repository is structured as a mono-repo containing both the backend and frontend components.

---

## 📂 Project Directory Structure

```
salaryfund-ai-frontend/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/          # Endpoint routers grouped by domain
│   │   ├── services/        # Orchestrates database transactions & business logic
│   │   ├── repositories/    # Database queries (SQLAlchemy 2.0)
│   │   ├── models/          # Database ORM models (29 tables)
│   │   ├── schemas/         # Pydantic validation contracts
│   │   ├── ai/              # ML Engines (Eligibility, Fraud, Career Score)
│   │   ├── security/        # JWT, bcrypt, OTP, Field-level Fernet encryption
│   │   └── utils/           # Amortization, OCR (Tesseract), clients (SMS/Email)
│   ├── alembic/             # Database migrations
│   ├── tests/               # Backend test suite (pytest)
│   └── docker-compose.yml   # Multi-container orchestration
│
└── frontend/                 # Vite & React Application
    ├── src/
    │   ├── components/      # UI components, layout, common widgets & charts
    │   ├── pages/           # Pages (Landing, Auth, Dashboards, Loans)
    │   ├── services/api/    # Axios client and API wrappers
    │   ├── store/           # Zustand state management (auth, theme, sidebar)
    │   ├── hooks/           # TanStack query hooks with mock-data fallback
    │   └── routes/          # Protected and lazy-loaded routes
    └── tailwind.config.js   # Style design system
```

---

## 🔄 Core End-to-End Workflow

The platform operates on a structured flow connecting employers, employees, and platform administrators.

```mermaid
sequenceDiagram
    autonumber
    actor Employer as Employer HR / Admin
    actor Employee as Employee / Borrower
    actor System as Backend AI Engine
    actor Admin as Platform Admin / Lender

    Employer->>System: Register & Onboard Organization
    Employer->>System: Upload / Sync Employee Directory (Salary, PAN, Aadhaar)
    Employee->>System: Register & Log In (OTP Verification)
    Employee->>System: Upload PAN & Aadhaar (Triggers OCR & Forgery Scan)
    Admin->>System: Verify KYC Documents manually (Support Dashboard)
    Employee->>System: Request Earned Wage / Loan
    System->>System: Run AI Engines (Eligibility, Fraud risk, Career Score)
    alt Approved Automatically
        System->>Employee: Auto-approve & Disburse Funds
    else Flagged for Review
        System->>Admin: Alert Admin (shows SHAP values, Fraud warnings)
        Admin->>System: Manually Approve / Reject Application
    end
    System->>System: Generate Amortized Repayment / EMI Schedule
    Employer->>System: Ingest Monthly Payroll Cycle (Triggers auto-deductions)
    System->>System: Net repayments & close loan when paid in full
```

### 1. Onboarding
* **Employers**: Onboarded onto the platform with department configurations and default loan/salary policies.
* **Employees**: Added by the employer's HR or synced via sync connectors. They log in securely using password hashing and OTP-based verification.
* **Documents & KYC**: Employees upload PAN or Aadhaar card images. The backend runs a Tesseract OCR pipeline to extract fields (name, number, DOB) and computes an OpenCV forgery score (clone self-similarity & edge variance).

### 2. Loan Submission & Processing
* Employees request an advance or short-term loan.
* The backend AI review engine is triggered:
  * **Loan Eligibility Engine**: Runs RandomForest, XGBoost, and LogisticRegression models to assess request parameters (DTI, salary, tenure) and returns approval probability with full **SHAP (SHapley Additive exPlanations)** feature importances.
  * **Fraud Detection Engine**: Assesses duplicate PAN counts, salary volatility, and Isolation Forest anomaly scores to label applications as safe or suspicious.
  * **Career Credit Score™**: Generates a 300–900 score using HRMS parameters (stability, promotions, performance, attendance) and repayment behavior.
  * **Financial Wellness Engine**: Evaluates debt-to-income and savings ratios to provide feedback.

### 3. Disbursement & Repayments
* Upon approval, a loan is disbursed. The system generates an amortization schedule using reducing-balance calculations.
* During payroll cycles, the employer uploads bulk salary files. The system automatically nets out pending EMIs from the employee's salary and applies repayments.

---

## ⚙️ Environment Configuration

You must create a `.env` file in the root of both directories.

### Backend Configurations (`backend/.env`)
Create `backend/.env` using the template inside [backend/.env.example](file:///c:/Users/dilip/Downloads/salaryfund-ai-frontend/backend/.env.example):

| Key | Description | How to Configure |
| :--- | :--- | :--- |
| `SECRET_KEY` | Signs JWT authorization tokens | Run: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FIELD_ENCRYPTION_KEY` | Fernet key for encrypting local database PII fields | Run: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `DATABASE_URL` | Async connection string for PostgreSQL | e.g. `postgresql+asyncpg://salaryfund:salaryfund_dev_password@postgres:5432/salaryfund_ai` |
| `DATABASE_URL_SYNC` | Sync connection string for Alembic | e.g. `postgresql+psycopg2://salaryfund:salaryfund_dev_password@postgres:5432/salaryfund_ai` |
| `REDIS_URL` | Redis URL for caching | e.g. `redis://redis:6379/0` (Use `localhost` instead of `redis` if running locally) |
| `CELERY_BROKER_URL` | Celery broker URL | e.g. `redis://redis:6379/1` |
| `CELERY_RESULT_BACKEND` | Celery task result backend URL | e.g. `redis://redis:6379/2` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | Mail gateway credentials | **Optional**: Fallback logs messages to console in local development |
| `SMS_PROVIDER_API_KEY` | SMS gateway API Key | **Optional**: Fallback logs messages to console in local development |

### Frontend Configurations (`frontend/.env`)
Create `frontend/.env` using the template inside [frontend/.env.example](file:///c:/Users/dilip/Downloads/salaryfund-ai-frontend/frontend/.env.example):

| Key | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the running FastAPI backend | `http://localhost:8000/api/v1` |
| `VITE_ENABLE_LENDER_PORTAL` | Enables the lender dashboard module | `true` |
| `VITE_ENABLE_ADMIN_PORTAL` | Enables the platform admin module | `true` |

---

## 🚀 Quick Start Guide

### Option A: Running with Docker Compose (Recommended)
This launches Postgres, Redis, the FastAPI backend, migrations, seed scripts, ML training, Celery, and Flower in one unified command.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the `.env` template and set configuration keys:
   ```bash
   cp .env.example .env
   # Edit backend/.env to add your custom SECRET_KEY and FIELD_ENCRYPTION_KEY
   ```
3. Run the orchestration stack:
   ```bash
   docker compose up --build
   ```
4. Access dashboards & monitoring:
   * **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Celery Flower Dashboard**: [http://localhost:5555](http://localhost:5555)

5. Start the frontend:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   * Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Running Locally (Manual Setup)

#### 1. Setup Backend
Prerequisites: A running PostgreSQL instance and Redis instance.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows, run: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations, seed testing records, and train ML submodels
alembic upgrade head
python -m app.database.seeds.seed_data
python -m app.ai.training.train_eligibility

# Start the uvicorn web server
uvicorn app.main:app --reload
```

In separate terminals, start the asynchronous tasks scheduler and workers:
```bash
# Start Worker
celery -A app.background_tasks.celery_app worker --loglevel=info
# Start Beat
celery -A app.background_tasks.celery_app beat --loglevel=info
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Document Verification & Credit Score Integrations

To run this platform in a production sandbox, you should understand how third-party connections are structured:

### PAN/Aadhaar Validation
* **Built-in (Free)**: Uses OpenCV and Pytesseract OCR locally to extract the PAN string and verify if it matches regex rules. No registration or keys are required.
* **Production Integration (Paid)**: You can connect to Indian government-authorized databases via KYC aggregators (Karza, Digio, cashfree, or Surepass). This costs between **₹1 to ₹3 per validation** and requires an active API key to replace the manual admin check inside [document_service.py](file:///c:/Users/dilip/Downloads/salaryfund-ai-frontend/backend/app/services/document_service.py).

### CIBIL & Bureau Credit Scores
* **Built-in (Free)**: The system implements an internal **Career Credit Score™** algorithm in [engine.py](file:///c:/Users/dilip/Downloads/salaryfund-ai-frontend/backend/app/ai/career_credit/engine.py). It generates scorecards (300-900) by querying local employer ratings, promotions history, and payment discipline.
* **Production Integration (Paid)**: Integrating direct bureau checks (TransUnion CIBIL or Experian) requires regulatory verification, compliance approvals, security deposit setup, and transactional query fees of **₹10 to ₹50 per report**.

---

## 🧪 Testing
Run the backend test suite:
```bash
cd backend
pytest tests/ -v
```
This tests authentication modules, amortization calculators, and all AI inference systems under 33 automated tests.

For the frontend, the hooks in `src/hooks` are written with fallback fixtures. If the backend server is offline or unreachable, the frontend automatically falls back to static fixtures located in `src/utils/mockData.js` so you can demo UI states and dashboard configurations smoothly.

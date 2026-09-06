# 🚘 AutoRent Enterprise - Frontend Web Application

A modern, responsive, high-performance web application for the AutoRent Enterprise Car Rental Platform, built with **React 19**, **Vite 8**, **Tailwind CSS v4**, and **Redux Toolkit**.

---

## ⚡ Tech Stack & Architecture

- **Framework**: React 19 (Hooks, Suspense, Error Boundaries)
- **Bundler & Dev Server**: Vite 8 (Ultra-fast HMR)
- **Styling**: Tailwind CSS v4 (Pure CSS engine with `@tailwindcss/vite`)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
- **Routing**: React Router DOM v7 (SPA client routing)
- **Icons**: Lucide React
- **HTTP Client**: Axios with global request/response interceptors:
  - **Silent Refresh Token Rotation (RTR)**: Auto-rotates expired access tokens via HttpOnly cookies without interrupting the user.
  - **Rate Limit Interception**: Intercepts HTTP 429 responses and displays auto-dismissing retry toast notifications.
- **Payments**: Razorpay Checkout SDK with cryptographic signature verification.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+ or pnpm 8+

### 2. Installation
```bash
cd client
npm install
```

### 3. Environment Configuration
Create a `.env` file or copy `.env.example`:
```bash
cp .env.example .env
```

| Variable | Description | Default (Local) |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Spring Boot API Endpoint | `http://localhost:1571/api/v1` |

> [!NOTE]
> In local development, leaving `VITE_API_BASE_URL=/api/v1` uses Vite's built-in reverse proxy configured in `vite.config.js` to prevent CORS issues.

### 4. Running Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### 5. Available Scripts
- `npm run dev`: Starts local development server on port 5173.
- `npm run build`: Compiles optimized production bundle into `dist/`.
- `npm run preview`: Previews production build locally.
- `npm run lint`: Runs ESLint across all source files.
- `npm run format`: Runs Prettier to auto-format JSX, JS, CSS, and HTML.

---

## 🌐 Deploying to Vercel

The frontend is fully configured for deployment on [Vercel](https://vercel.com).

### Step 1: Connect Repository
1. Push your repository to GitHub.
2. In Vercel, click **Add New...** -> **Project** and import your repository.

### Step 2: Configure Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `client` *(or repository root `/` as root `vercel.json` is provided)*
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables
In **Project Settings -> Environment Variables**:
- `VITE_API_BASE_URL`: `https://your-backend-domain.com/api/v1`

---

## 🛡️ Key Client Capabilities

1. **Role-Based Portals**:
   - **Customer Portal**: Browse vehicles, submit booking requests, monitor 30-minute payment countdowns, and pay via Razorpay.
   - **Car Owner Portal**: Register cars with RC & Insurance, manage fleet, accept/reject booking requests with ACID locking.
   - **Super Admin Governance**: Review pending owner KYC, approve/reject vehicles, inspect fleet, freeze malicious accounts.
2. **Sliding Window Rate Limit Alerts**:
   - If user exceeds request thresholds (Auth: 5/min, Payments: 10/min, Bookings: 15/min), an alert banner displays the exact seconds to wait before retry.
3. **Zero JSESSIONID / Clean Cookies**:
   - Authentication relies entirely on secure HttpOnly JWT cookies. No sessions, no localStorage token leaks.

# Sentinel — Security Operations Hub

A full-stack SOC utility for process monitoring, file integrity scanning, IOC hunting, behavioral anomaly detection, and incident response.

---

## What You Need Before Starting

You need **3 things** installed on your machine:

| Tool | Why | Install |
|:-----|:----|:--------|
| **Node.js v20+** | Runs the server and builds the client | [nodejs.org](https://nodejs.org) or `sudo apt install nodejs npm` |
| **MongoDB** | Stores users, alerts, anomalies, baselines | [mongodb.com](https://www.mongodb.com/try/download/community) or `sudo apt install mongodb` |
| **Git** | Clone the repo | `sudo apt install git` |

### Verify they are installed

```bash
node -v      # Should print v20.x.x or higher
mongosh      # Should open the MongoDB shell (type 'exit' to close)
git --version
```

---

## Step-by-Step: Run Locally (Easiest Way)

### 1. Clone the Project

```bash
git clone <your-repo-url>
cd SIERN_EX
```

### 2. Start MongoDB

Make sure MongoDB is running in the background:

```bash
# On systemd-based Linux:
sudo systemctl start mongod

# Verify it's running:
sudo systemctl status mongod
# Should show "active (running)"
```

### 3. Create the `.env` File

Copy the template and fill in your secrets:

```bash
cp .env.example server/.env
```

Now edit `server/.env`:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/sentinel
NODE_ENV=development
AUTH_STRATEGY=email
JWT_SECRET=change_this_to_a_random_64_char_string
REFRESH_TOKEN_SECRET=change_this_to_another_random_64_char_string
CLIENT_URL=http://localhost:5173
```

> **Generate random secrets easily:**
>
> ```bash
> openssl rand -hex 32
> ```
>
> Run it twice, paste one value as `JWT_SECRET` and the other as `REFRESH_TOKEN_SECRET`.

### 4. Install All Dependencies

From the project root, run:

```bash
npm install
npm run postinstall
```

This installs root deps, then `shared/`, `client/`, and `server/` dependencies automatically.

### 5. Start the Development Server

```bash
npm run dev
```

This starts **3 things simultaneously**:

- `shared` — TypeScript watcher (rebuilds shared types on change)
- `client` — Vite dev server at **<http://localhost:5173>**
- `server` — Express API at **<http://localhost:3000>**

### 6. Open the App

Open your browser and go to:

```
http://localhost:5173
```

You will be redirected to the **Login** page.

---

## First-Time Setup: Create a User

Since this is a fresh database, you need to register:

1. Navigate to `http://localhost:5173/register`
2. Enter an email and a password
3. Click **Register**
4. You will be automatically logged in and redirected to the Dashboard

---

## How to Test Every Feature

Once logged in, use the sidebar to navigate. Here's how to test each page:

### 1. Dashboard (`/`)

**What it does:** Shows system overview — active process count, alerts in last 24h, system status.

**How to test:**

- Open the Dashboard after login.
- You should see live stats (process count pulled from your actual machine).
- The alert count will be `0` until you trigger scans.

---

### 2. Process Monitor (`/processes`)

**What it does:** Lists all running processes on your machine with risk scores.

**How to test:**

- Navigate to **Process Monitor** from the sidebar.
- You should see a table of all your running processes (Firefox, node, bash, etc.).
- Processes in suspicious paths (like `/tmp/`) will have higher risk scores.
- **Kill test:** Find a non-critical process (e.g., open a `sleep 9999 &` in your terminal), then click **Kill** on it. Verify it disappears.

> ⚠️ **Warning:** Only kill processes you own. Killing system processes will crash services.

---

### 3. File Integrity Scanner (`/scanner`)

**What it does:** Hashes files (SHA256) and compares against a stored baseline to detect unauthorized changes.

**How to test:**

1. **Create a test directory:**

   ```bash
   mkdir -p /tmp/sentinel_test
   echo "hello world" > /tmp/sentinel_test/file1.txt
   echo "secret data" > /tmp/sentinel_test/file2.txt
   ```

2. In the Scanner page, enter path: `/tmp/sentinel_test`
3. Check "Include Subdirectories" and click **Create Baseline**.
4. Now **modify a file:**

   ```bash
   echo "HACKED" >> /tmp/sentinel_test/file1.txt
   ```

5. Run a **Scan with Compare Against Baseline** enabled.
6. You should see `file1.txt` marked as **MODIFIED** with a risk level.

---

### 4. IOC Threat Hunt (`/ioc-hunt`)

**What it does:** Searches running processes and filesystem for malicious Indicators of Compromise (hashes, IPs, domains).

**How to test:**

1. Navigate to **IOC Hunt**.
2. Enter a known hash (e.g., the SHA256 of `file1.txt` from the scanner test):

   ```bash
   sha256sum /tmp/sentinel_test/file1.txt
   ```

3. Paste the hash, set scope to **Filesystem**, set search path to `/tmp/sentinel_test`.
4. Click **Start Hunt**.
5. If the hash matches, you'll see a **Critical** hit.

**Process test:** Enter a process name like `node` as a domain-type IOC, set scope to **Processes**, and run the hunt. It should match your running node server.

---

### 5. Behavioral Detection (`/behavioral`)

**What it does:** Detects suspicious process behaviors using built-in rules.

**How to test:**

1. Navigate to **Behavioral Detection**.
2. Initially the anomaly table will be empty.
3. Click **View Rules** to see the 3 detection rules (BR-001, BR-002, BR-004).
4. Click **Simulate** next to any rule.
5. A simulated anomaly should appear in the table instantly.
6. Refresh the page — the anomaly should persist (it's stored in MongoDB, not faked anymore).

---

### 6. Response Center (`/response`)

**What it does:** Tracks containment actions (kill, isolate, quarantine) with full audit history.

**How to test:**

1. Navigate to **Response Center**.
2. Initially both tabs (Active Containments, Action History) will be empty.
3. To populate it, kill a process from the **Process Monitor** page — this will create a containment action record.
4. Go back to Response Center — you should see the kill action in the history.
5. Test the **Undo** button on an active containment.

---

### 7. Settings (`/settings`)

**What it does:** User preferences and theme switching.

**How to test:** Toggle dark/light mode and verify it persists on reload.

---

## Testing the Authentication System

### Login/Logout Flow

1. **Register** a new user at `/register`.
2. **Logout** (should redirect to `/login`).
3. **Login** again with the same credentials.
4. Close the browser tab, open a new one to `http://localhost:5173` — you should still be logged in (token persists in localStorage).

### Token Refresh Test

1. Login successfully.
2. Wait or manually delete the `accessToken` from `localStorage` (DevTools → Application → Local Storage).
3. Navigate to any protected page.
4. The app should automatically refresh using the `refreshToken` and continue working.
5. If both tokens are deleted, you should be redirected to `/login`.

---

## Quick Checklist: Is Everything Working?

| # | Feature | Test | Expected |
|:--|:--------|:-----|:---------|
| 1 | MongoDB connection | Check terminal output | `MongoDB Connected: localhost` |
| 2 | User registration | POST to `/register` | Account created, auto-login |
| 3 | Dashboard stats | Open `/` | Active process count > 0 |
| 4 | Process listing | Open `/processes` | Table of real OS processes |
| 5 | Process kill | Kill a test process | Process disappears |
| 6 | Scanner baseline | Create baseline on `/tmp/sentinel_test` | "Baseline created" message |
| 7 | Scanner detect | Modify file, re-scan | MODIFIED status shown |
| 8 | IOC Hunt (hash) | Hunt for known SHA256 | Match found with severity |
| 9 | IOC Hunt (process) | Hunt for "node" | Match in running processes |
| 10 | Behavioral simulate | Click Simulate on BR-001 | Anomaly appears in table |
| 11 | Behavioral persist | Refresh page after simulate | Anomaly still visible |
| 12 | Response Center | Kill a process, check history | Action logged in audit trail |
| 13 | Auth token refresh | Delete accessToken, navigate | Auto-refresh, no logout |
| 14 | Dark/Light mode | Toggle in Settings | Theme changes and persists |

---

## Troubleshooting

| Problem | Solution |
|:--------|:---------|
| `Error: DATABASE_URL variables in .env missing` | You forgot to create `server/.env`. Run `cp .env.example server/.env` |
| `MongoServerError: connect ECONNREFUSED` | MongoDB is not running. Start it with `sudo systemctl start mongod` |
| Processes page is empty | The `ps-list` package requires Linux or macOS. It won't work on Windows WSL without native access. |
| CORS errors in browser console | Make sure `CLIENT_URL=http://localhost:5173` is in your `.env` |
| `Cannot find module` TypeScript errors | Run `npm run postinstall` to install all dependencies |

---

## Project Structure

```
SIERN_EX/
├── client/               # React Frontend (Vite)
│   ├── src/
│   │   ├── api/          # Axios API clients
│   │   ├── components/   # UI components (Shadcn/Radix)
│   │   ├── contexts/     # Auth context provider
│   │   ├── pages/        # Route pages
│   │   └── App.tsx       # Router definition
│   └── vite.config.ts    # Dev server + API proxy config
├── server/               # Express Backend
│   ├── config/           # DB connection
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic
│   ├── utils/            # JWT helpers
│   └── server.ts         # Entry point
├── shared/               # Shared TypeScript types
├── .env.example          # Environment template
└── package.json          # Root monorepo scripts
```

---

## License

ISC

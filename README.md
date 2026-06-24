# WorkLedger

WorkLedger is a high-performance, multi-tenant SaaS platform built for freelancers and small agencies to manage their clients, project lifecycles, milestone billing, task boards, and invoicing.

---

## 🛠️ Tech Stack
- **Backend API**: NestJS (v11), Prisma Client (v6), Postgres (Neon), Redis (Upstash)
- **PDF Generation**: Go (1.24) microservice using Chrome DevTools Protocol (`chromedp`) and Echo
- **Package Manager**: `pnpm` (v10) in a monorepo workspace configuration

---

## 📁 Project Structure
```
workledger/
├── apps/
│   ├── api/            # NestJS Backend API
│   └── pdf/            # Go PDF Microservice
├── packages/
│   └── shared/         # Common TypeScript enums and API envelopes
├── ProjectArchitecture/ # Product roadmap, architecture specs, PRDs
└── README.md
```

---

## ⚙️ Storage Configuration (`STORAGE_PROVIDER`)

WorkLedger abstracts storage providers using an adapter pattern. You can configure which storage backend is active in `apps/api/.env` and the Go PDF microservice:

```env
STORAGE_PROVIDER=local
```

### Supported Providers:
1. **`local` (Default)**:
   - Saves files directly on the local disk under `apps/api/public/uploads/`.
   - Serving static files is configured automatically under the `/public` prefix of the NestJS server.
   
2. **`cloudinary`**:
   - Implements signed uploads. Generates HMAC SHA-1 signatures dynamically for secure, direct client uploads without exposing secrets.
   - Configure the following env variables to activate:
     ```env
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     CLOUDINARY_UPLOAD_PRESET=workledger-uploads
     ```

3. **`r2`**:
   - Utilizes Cloudflare R2 object storage. Generates pre-signed PUT URLs for direct S3-compatible client uploads.
   - Configure the following env variables to activate:
     ```env
     R2_ACCOUNT_ID=your_account_id
     R2_ACCESS_KEY_ID=your_access_key
     R2_SECRET_ACCESS_KEY=your_secret_access_key
     R2_BUCKET_NAME=workledger-files
     R2_PUBLIC_URL=https://your-r2-public-url.com
     ```

> [!TIP]
> **Zero-Code Switchability**: Switching between `local`, `cloudinary`, and `r2` storage backends can be done at any time by changing the `STORAGE_PROVIDER` variable in `apps/api/.env`. Since the backend leverages a unified `StorageService` interface, all core endpoints, controllers, and microservices will function with zero code changes.

---

## 🚀 Running Locally

### 1. Start NestJS API Server
Navigate to the root directory and run:
```powershell
pnpm --filter @workledger/api run start:dev
```
The API server will listen on `http://localhost:8000` with Swagger docs exposed at `http://localhost:8000/api/docs`.

### 2. Start Go PDF Microservice
Navigate to `apps/pdf` and run the pre-built binary:
```powershell
.\pdf.exe
```
Or rebuild and run:
```powershell
go build -o pdf.exe main.go
.\pdf.exe
```
The PDF microservice will listen on `http://localhost:8080`.

---

## 🧪 E2E Verification Tests

We maintain programmatic integration test suites written in PowerShell at the workspace root:

- **Projects Lifecycle**: `powershell -ExecutionPolicy Bypass .\test-projects.ps1`
- **Proposals & Contracts**: `powershell -ExecutionPolicy Bypass .\test-proposals.ps1`
- **Milestones & Tasks**: `powershell -ExecutionPolicy Bypass .\test-milestones-tasks.ps1`
- **Invoices & Payments**: `powershell -ExecutionPolicy Bypass .\test-invoices.ps1`
- **Files & Messaging**: `powershell -ExecutionPolicy Bypass .\test-files-comments.ps1`
- **Settings & SaaS Admin**: `powershell -ExecutionPolicy Bypass .\test-settings-admin.ps1`

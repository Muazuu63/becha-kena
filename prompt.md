# বেচা-কেনা (Becha-Kena) — Backend Master Implementation Prompts
**ডকুমেন্ট ভার্সন:** 1.0.0 (Production Roadmap)  
**স্ট্যাটাস:** চূড়ান্ত এক্সিকিউশন ব্লুপ্রিন্ট  
**টার্গেট আর্কিটেকচার:** Layered Monolith (Express.js + TypeScript + MongoDB Atlas + Redis + Socket.io + BullMQ)  
**রেফারেন্স ফাইলসমূহ:** `PRD.md`, `architecture.md`, `database-schema.md`, `database.md`, `api-spec.md`, `dfd.md`  

---

## 📌 নির্দেশনা ও ব্যবহার বিধি (How to Use This Prompt Guide)

এই ডকুমেন্টটি বেচা-কেনা (Becha-Kena) প্ল্যাটফর্মের **সম্পূর্ণ ব্যাকএন্ড সিস্টেম শূন্য থেকে প্রোডাকশন-গ্রেড পর্যায়ে বিল্ড করার জন্য ধাপে ধাপে সাজানো প্রম্পট গাইড**।

* **পদ্ধতি:** প্রতিটি প্রম্পট ক্রমানুসারে (Sequential Order) এক্সিকিউট করতে হবে। কোনো ধাপ স্কিপ করা যাবে না, কারণ প্রতিটি ধাপ পূর্ববর্তী ধাপের টাইপ ডেফিনিশন ও আর্কিটেকচারাল লেয়ারের ওপর নির্ভরশীল।
* **আর্কিটেকচারাল প্যাটার্ন:** Layered Monolith — `Routes -> Controllers -> Services -> Repositories/Models` এবং সেন্ট্রালাইজড ভ্যালিডেশন (Zod) ও এরর হ্যান্ডলিং (RFC 7807)।

---

## সূচিপত্র (Prompt Phases)

1. [Phase 0: Environment, Tooling & Foundation Setup](#phase-0-environment-tooling--foundation-setup)
2. [Phase 1: Core Database Models & Mongoose Schemas](#phase-1-core-database-models--mongoose-schemas)
3. [Phase 2: Authentication, Security & Session Management (Module 1)](#phase-2-authentication-security--session-management-module-1)
4. [Phase 3: NID KYC Verification & Minor Parental Consent Engine (Module 2)](#phase-3-nid-kyc-verification--minor-parental-consent-engine-module-2)
5. [Phase 4: Categories & Product Listings with Anti-Theft IMEI Gate (Modules 3 & 4)](#phase-4-categories--product-listings-with-anti-theft-imei-gate-modules-3--4)
6. [Phase 5: Privacy Shield, Phone Reveal & Real-time Messaging (Modules 5 & 6)](#phase-5-privacy-shield-phone-reveal--real-time-messaging-modules-5--6)
7. [Phase 6: Deal Finalization, ACID Transactions & Mutual Ratings (Module 7)](#phase-6-deal-finalization-acid-transactions--mutual-ratings-module-7)
8. [Phase 7: Post-Purchase Disputes, Fraud Investigation & Ban Engine (Module 8)](#phase-7-post-purchase-disputes-fraud-investigation--ban-engine-module-8)
9. [Phase 8: Payments, Monetization & IPN Webhook Handlers (Module 9)](#phase-8-payments-monetization--ipn-webhook-handlers-module-9)
10. [Phase 9: Real-time Notifications & Background Maintenance Jobs (Module 10)](#phase-9-real-time-notifications--background-maintenance-jobs-module-10)
11. [Phase 10: Admin Backoffice Governance & Law Enforcement Compliance (Module 11)](#phase-10-admin-backoffice-governance--law-enforcement-compliance-module-11)
12. [Phase 11: End-to-End Integration Testing, Docker & Deployment](#phase-11-end-to-end-integration-testing-docker--deployment)

---

## Phase 0: Environment, Tooling & Foundation Setup

### 🎯 Prompt 0.1: Project Scaffolding, TypeScript & Tooling Initialization

```markdown
Act as a Principal Backend Architect. Initialize the backend project for "Becha-Kena" (বেচা-কেনা), a verified C2C recommerce platform for Bangladesh.

Requirements:
1. Initialize a Node.js project using npm and configure TypeScript (v5.x).
   - Configure `tsconfig.json` with strict mode (`strict: true`), ES2022 target, moduleResolution `node`, rootDir `src`, outDir `dist`, and path aliases (`@/` mapping to `src/`).
2. Install runtime dependencies:
   - `express`, `dotenv`, `zod`, `cors`, `helmet`, `compression`, `cookie-parser`, `pino`, `pino-pretty`, `uuid`.
3. Install dev dependencies:
   - `typescript`, `ts-node-dev`, `@types/node`, `@types/express`, `@types/cors`, `@types/cookie-parser`, `@types/uuid`, `eslint`, `prettier`.
4. Establish the clean Layered Monolith directory layout:
   ```
   src/
   ├── config/             # Environment, DB, Redis, Cloud clients
   ├── constants/          # Enums, status codes, error codes
   ├── middlewares/        # Auth, error, rate-limit, validation
   ├── modules/            # Feature modules (controller, service, repository, routes, validation)
   ├── jobs/               # BullMQ queues & workers
   ├── utils/              # Crypto, Luhn, phone, logger
   ├── types/              # Global express types, shared interfaces
   ├── app.ts              # Express application setup & middleware chain
   └── server.ts           # HTTP server lifecycle & graceful shutdown
   ```
5. Create `.env.example` containing:
   - `NODE_ENV`, `PORT`, `API_PREFIX=/api/v1`, `CLIENT_URL`, `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `HMAC_CONTACT_SECRET`, `SSL_WIRELESS_API_KEY`, `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `AWS_S3_BUCKET_PRIVATE`, `GOOGLE_VISION_KEY`.
6. Write a Zod-powered environment validation utility (`src/config/env.ts`) that crashes the process immediately on startup if any required environment variable is missing or invalid.
```

---

### 🎯 Prompt 0.2: Database & Redis Connection with Health Checks & Graceful Shutdown

```markdown
Act as a Senior Database Engineer. Implement resilient MongoDB Atlas and Redis connections for Becha-Kena.

Requirements:
1. `src/config/database.ts`:
   - Connect to MongoDB using Mongoose (v8.x).
   - Configure pool size (`maxPoolSize: 50`), autoIndex disabled in production (`autoIndex: false`), and connection timeouts.
   - Attach connection event listeners (`connected`, `error`, `disconnected`).
2. `src/config/redis.ts`:
   - Initialize `ioredis` client with retry strategy (exponential backoff) and reconnectOnError.
   - Export standard Redis client and a separate subscriber client for Socket.io.
3. `src/utils/logger.ts`:
   - Setup Pino logger with JSON structured logging in production and colorized output in development.
4. `src/server.ts`:
   - Implement graceful shutdown on `SIGINT` and `SIGTERM` signals:
     1. Stop accepting new HTTP requests.
     2. Close Socket.io server.
     3. Close Redis connections.
     4. Disconnect Mongoose cleanly.
     5. Exit process with code 0.
5. Create a health check route `GET /health` and `GET /api/v1/health` returning DB and Redis ping latencies.
```

---

### 🎯 Prompt 0.3: Centralized RFC 7807 Error Handling & Validation Middlewares

```markdown
Act as a Senior API Platform Engineer. Build the centralized error handling and request validation middlewares adhering to RFC 7807 (Problem Details for HTTP APIs) as defined in `api-spec.md`.

Requirements:
1. `src/utils/app-error.ts`:
   - Define a custom `AppError` class extending `Error` with properties:
     - `statusCode` (number)
     - `code` (Domain error code string, e.g. `AUTH_INVALID_CREDENTIALS`)
     - `detail` (Bengali localized human-readable message)
     - `errors` (optional field validation array)
2. `src/middlewares/validate.middleware.ts`:
   - Create a generic request validation middleware using Zod:
     - Accepts `{ body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }`.
     - On failure, formats issues into `{ field, message, rule }` and throws an `AppError` with status 400 and code `VALIDATION_FAILED`.
3. `src/middlewares/error.middleware.ts`:
   - Global Express error handler middleware `(err, req, res, next)`:
     - Handles `AppError`, ZodError, Mongoose CastError, Mongoose Duplicate Key (code 11000 -> `409 Conflict`), and unhandled generic errors.
     - Formats all errors into RFC 7807 JSON:
       `{ type, title, status, detail, instance, code, errors, trace_id, timestamp }`.
     - In production (`NODE_ENV === 'production'`), NEVER expose stack traces or internal server error details.
```

---

### 🎯 Prompt 0.4: Swagger / OpenAPI Interactive Documentation Route (`/api-docs`)

```markdown
Act as an API Tooling Engineer. Configure Swagger UI and OpenAPI documentation for the Becha-Kena backend.

Requirements:
1. Install `swagger-ui-express` and `yamljs` (with corresponding `@types/swagger-ui-express`).
2. Generate or link an OpenAPI 3.0 specification (`src/docs/openapi.yaml`) covering all core authentication, listing, and dispute endpoints based on `api-spec.md`.
3. Mount Swagger UI at `GET /api-docs` and raw spec at `GET /api-docs/openapi.json`.
4. Ensure Swagger UI is enabled in development/staging and protected or disabled in production according to `NODE_ENV`.
```

---

## Phase 1: Core Database Models & Mongoose Schemas

### 🎯 Prompt 1.1: User, NID Verification & Category Mongoose Schemas

```markdown
Act as a Senior MongoDB Architect. Implement the Mongoose models and TypeScript interfaces for `User`, `NidVerification`, and `Category` based on `database-schema.md` and `database.md`.

Requirements:
1. `src/modules/users/user.model.ts`:
   - Interface `IUser` and Schema:
     - `phone_number` (String, required, unique, regex `/^\+8801[3-9]\d{8}$/`).
     - `password_hash` (String, required).
     - `full_name` (String, required, trim).
     - `avatar_url` (String, optional).
     - `role` (Enum: `GUEST`, `UNVERIFIED_USER`, `PARENT_VERIFIED_MINOR`, `VERIFIED_USER`, `MODERATOR`, `SUPER_ADMIN`, default: `UNVERIFIED_USER`).
     - `nid_status` (Enum: `UNVERIFIED`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, default: `UNVERIFIED`, indexed).
     - `nid_verification_id` (ObjectId, ref: `NidVerification`).
     - `parent_user_id` (ObjectId, ref: `User`, optional).
     - `rating_average` (Number, default: 0.0, min: 0.0, max: 5.0).
     - `rating_count`, `completed_deals_count`, `strikes_count` (Max: 3), `warnings_count`.
     - `is_frozen` (Boolean, default: false, indexed), `is_banned` (Boolean, default: false, indexed).
     - `active_sessions_count` (Number, default: 0, max: 2).
   - Compound index: `{ role: 1, is_banned: 1 }`.
2. `src/modules/kyc/nid-verification.model.ts`:
   - Interface `INidVerification` and Schema:
     - `user_id` (ObjectId, ref: `User`, required, unique).
     - `nid_number_masked` (String, required).
     - `nid_hash` (String, required, unique, indexed - SHA-256 hash).
     - `date_of_birth` (Date, required).
     - `ocr_extracted_data` (Mixed, optional).
     - `front_image_ref`, `back_image_ref` (String, encrypted S3 object keys).
     - `is_image_purged` (Boolean, default: false).
     - `verified_by_admin` (ObjectId, ref: `User`).
     - `rejection_reason` (Enum).
     - `verified_at` (Date, indexed).
3. `src/modules/categories/category.model.ts`:
   - Interface `ICategory` and Schema:
     - `name_bn`, `name_en`, `slug` (unique, indexed).
     - `parent_id` (ObjectId, ref: `Category`, default null).
     - `icon_url` (String, required).
     - `required_fields` (Array of String, e.g. `["imei_number"]`).
     - `optional_fields` (Array of String).
     - `display_order` (Number), `is_active` (Boolean, default: true).
   - Compound index: `{ parent_id: 1, is_active: 1 }`.
```

---

### 🎯 Prompt 1.2: Product Listings Model with Anti-Theft Indexes & GeoJSON

```markdown
Act as a Senior MongoDB Developer. Implement the `Listing` model with Geospatial 2dsphere index and partial unique IMEI index based on `database-schema.md`.

Requirements:
1. `src/modules/listings/listing.model.ts`:
   - Interface `IListing` and Schema:
     - `seller_id` (ObjectId, ref: `User`, required, index: true).
     - `title` (String, min: 10, max: 100, trim).
     - `slug` (String, required, unique).
     - `description` (String, min: 30, max: 3000).
     - `category_id` (ObjectId, ref: `Category`, required, index: true).
     - `price` (Number, min: 10, max: 5000000).
     - `is_negotiable` (Boolean, default: false).
     - `condition` (Enum: `LIKE_NEW`, `GENTLY_USED`, `FAIR`, `FOR_PARTS`).
     - `imei_number` (String, optional, trim, 15-digit).
     - `serial_number` (String, optional).
     - `photos` (Array of `{ url: String, is_primary: Boolean }`, min: 1, max: 5).
     - `cash_memo_url`, `box_photo_url` (String, optional).
     - `location` (GeoJSON Point: `{ type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [lng, lat] }`).
     - `division`, `district`, `thana` (String, required).
     - `status` (Enum: `DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `RESERVED`, `SOLD`, `EXPIRED`, `REJECTED`, `BANNED_SUSPENDED`, default: `PENDING_REVIEW`, index: true).
     - `is_featured` (Boolean, default: false).
     - `featured_expires_at` (Date, optional).
     - `is_urgent` (Boolean, default: false).
     - `views_count` (Number, default: 0).
     - `expires_at` (Date, required, index: true - 45 days lifespan).
   - Critical Indexes:
     - `location: "2dsphere"` (for 10 km proximity radius search).
     - `{ category_id: 1, status: 1, created_at: -1 }` (for category browsing).
     - `{ is_featured: -1, created_at: -1 }` (for boosting sponsored ads).
     - **Partial Unique Index on `imei_number`:**
       `unique: true, sparse: true, partialFilterExpression: { status: { $in: ['ACTIVE', 'PENDING_REVIEW', 'RESERVED'] } }`.
```

---

### 🎯 Prompt 1.3: Chat, Ratings, Disputes, Payments, Notifications & Audit Log Models

```markdown
Act as a Senior Database Engineer. Implement the remaining Mongoose models for Becha-Kena based on `database-schema.md`:

Requirements:
1. `src/modules/chats/chat-room.model.ts` & `src/modules/chats/message.model.ts`:
   - `ChatRoom`: `listing_id`, `buyer_id`, `seller_id`, `status` (`ACTIVE`, `LOCKED`, `ARCHIVED`), `suggested_safe_zone` (`{ name, lat, lng }`), `last_message_preview`, `last_message_at`, `unread_buyer_count`, `unread_seller_count`.
     - Index: Compound unique `{ buyer_id: 1, seller_id: 1, listing_id: 1 }`.
   - `Message`: `chat_room_id`, `sender_id`, `content`, `content_type` (`TEXT`, `SYSTEM_ALERT`, `PRICE_CHANGE_NOTICE`, `SAFE_ZONE_SUGGESTION`), `is_filtered`, `is_archived` (Boolean, default: false).
     - Indexes: `{ chat_room_id: 1, created_at: -1 }`, `{ created_at: 1, is_archived: 1 }` (for 90-day retention cron).
2. `src/modules/ratings/rating.model.ts`:
   - `listing_id`, `reviewer_id`, `reviewee_id`, `role_type` (`BUYER_TO_SELLER`, `SELLER_TO_BUYER`), `score` (1-5), `comment`, `tags`, `is_disputed`, `window_expires_at` (Date, indexed).
   - Compound unique index: `{ listing_id: 1, reviewer_id: 1 }`.
3. `src/modules/disputes/dispute.model.ts`:
   - `listing_id`, `plaintiff_id`, `defendant_id`, `reason` (`CLONE_DEVICE`, `ICLOUD_LOCKED`, `HARDWARE_FAULT`, `STOLEN_SUSPECT`, `MISLEADING_INFO`), `description`, `evidence_urls`, `status` (`OPEN`, `UNDER_INVESTIGATION`, `RESOLVED_BUYER_WIN`, `RESOLVED_SELLER_WIN`, `DISMISSED`), `assigned_admin_id`, `admin_resolution_notes`, `resolved_at`.
   - Indexes: `{ status: 1, created_at: -1 }`, `{ defendant_id: 1 }`.
4. `src/modules/payments/payment.model.ts`:
   - `user_id`, `listing_id`, `type` (`FEATURED_AD_3D`, `FEATURED_AD_7D`, `URGENT_TAG`, `EXPRESS_VERIFY`), `amount`, `gateway` (`BKASH`, `NAGAD`), `gateway_tx_id`, `idempotency_key` (unique), `status`.
5. `src/modules/notifications/notification.model.ts`:
   - `user_id`, `title`, `message`, `event_type`, `action_url`, `is_read`.
   - TTL Index: `{ created_at: 1 }` with `expireAfterSeconds: 2592000` (30 days).
6. `src/modules/audit/audit-log.model.ts`:
   - `actor_id`, `actor_role`, `action_type`, `target_entity_type`, `target_entity_id`, `old_state`, `new_state`, `ip_address`, `user_agent`, `timestamp`.
   - Read-only schema, index `{ timestamp: -1, action_type: 1 }`.
```

---

### 🎯 Prompt 1.4: Production Database Seeder Script (`src/scripts/seed.ts`)

```markdown
Act as a Database Administrator. Build an idempotent database seeding script for development, automated testing, and initial production bootstrapping.

Requirements:
1. `src/scripts/seed.ts`:
   - Idempotency: Clears or safely upserts seed records without creating duplicates.
   - Seed Category Tree:
     - Root: "ইলেকট্রনিক্স" (Electronics), "গৃহস্থালী পণ্য" (Home Appliances), "যানবাহন" (Vehicles).
     - Sub-categories: "স্মارتফোন" (Smartphones, `required_fields: ["imei_number"]`), "ল্যাপটপ ও কম্পিউটার" (Laptops, `required_fields: ["serial_number"]`).
   - Seed System Accounts:
     - Super Admin: `phone_number: "+8801900000001"`, `role: "SUPER_ADMIN"`, password hashed with Argon2, TOTP secret initialized.
     - Backoffice Moderator: `phone_number: "+8801900000002"`, `role: "MODERATOR"`.
   - Seed Test Verified Users:
     - 3 verified adult users (`VERIFIED_USER`, `nid_status: "APPROVED"`).
     - 1 parental-verified minor user (`PARENT_VERIFIED_MINOR`).
   - Seed Sample Listings:
     - 5 realistic listings with GeoJSON Point coordinates in Dhaka (Dhanmondi, Gulshan, Mirpur), valid Luhn-checked IMEIs, and active status.
2. Add npm script `"seed": "ts-node src/scripts/seed.ts"` to `package.json`.
```

---

## Phase 2: Authentication, Security & Session Management (Module 1)

### 🎯 Prompt 2.1: Dual-Token JWT, Password Hashing & Redis Blacklist Service

```markdown
Act as a Cybersecurity & Backend Engineer. Implement cryptographic authentication services for Becha-Kena.

Requirements:
1. `src/utils/password.ts`:
   - Use `bcryptjs` or `@node-rs/argon2` for password hashing and verification.
2. `src/modules/auth/token.service.ts`:
   - Dual-token JWT management:
     - Access Token: 15 minutes expiry, payload `{ userId, role, nidStatus }`.
     - Refresh Token: 7 days expiry, cryptographically secure UUID or long JWT stored in HttpOnly cookie.
   - Redis Session & Blacklist:
     - Store active session in Redis: `session:<userId>:<deviceId>`. Enforce max 2 concurrent sessions per user.
     - On logout or password reset, push JWT `jti` to Redis blacklist with TTL equal to remaining token life.
3. `src/middlewares/auth.middleware.ts`:
   - `authenticate`: Validates Bearer access token, checks Redis blacklist, attaches `req.user` to Express Request.
   - `requireRole(...roles)`: RBAC guard checking `req.user.role`.
   - `requireNidVerified`: Gatekeeper verifying `req.user.nidStatus === 'APPROVED'`. Throws `403 Forbidden` (`PRIVACY_NID_VERIFICATION_REQUIRED`) if not approved.
```

---

### 🎯 Prompt 2.2: Auth Endpoints (Send OTP, Register, Login, Refresh, Logout, /me)

```markdown
Act as a Senior Express.js Engineer. Build the complete authentication routes, controller, service, and Zod validators corresponding to Module 1 of `api-spec.md`.

Requirements:
1. Zod Validation Schemas (`src/modules/auth/auth.validation.ts`):
   - `sendOtpSchema`: Bangladeshi phone number regex `/^\+8801[3-9]\d{8}$/` + `recaptcha_token`.
   - `verifyOtpSchema`: Phone, 6-digit numeric OTP, full name, strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char).
   - `loginSchema`: Phone, password, device fingerprint.
2. Google reCAPTCHA v3 verification utility (`src/utils/recaptcha.ts`):
   - Validates client token with Google API. Rejects if score < 0.5.
3. SMS Gateway Service (`src/services/sms.service.ts`):
   - Generates 6-digit OTP, saves in Redis with 120s TTL (`otp:<phone>`).
   - Dispatches SMS via SSL Wireless API with GP failover fallback.
4. Endpoints implementation:
   - `POST /api/v1/auth/register/send-otp` (Rate limit: 3/10min per phone).
   - `POST /api/v1/auth/register/verify-otp` (Sets HttpOnly `refresh_token` cookie, returns access token + user).
   - `POST /api/v1/auth/login` (Rate limit: 5 failures/15min).
   - `POST /api/v1/auth/refresh-token` (Reads cookie, rotates refresh token).
   - `POST /api/v1/auth/logout` (Blacklists token in Redis, clears cookie).
   - `GET /api/v1/auth/me` (Returns sanitized user profile and trust scores).
```

---

### 🎯 Prompt 2.3: Mock Service Providers (SMS, Vision OCR & bKash Sandbox) for Autonomous Dev

```markdown
Act as a Test Infrastructure Engineer. Implement Mock Service Adapters so that any AI agent or local developer can run, test, and develop the entire backend without requiring active paid third-party credentials.

Requirements:
1. `src/services/mock/mock-sms.service.ts`:
   - When `ENABLE_MOCK_SMS=true` (or when `SSL_WIRELESS_API_KEY` is not set):
     - Logs generated OTP directly to Pino logger and console: `[MOCK SMS GATEWAY] Sent OTP ${otp} to ${phone}`.
     - Saves OTP in Redis as normal, allowing registration/login tests to pass autonomously.
2. `src/services/mock/mock-ocr.service.ts`:
   - When `ENABLE_MOCK_OCR=true`:
     - Simulates Google Vision OCR. Returns deterministic result:
       `{ name: "মুহাম্মদ তানভীর", nid_number: "19922695847000123", dob: new Date("1992-05-14"), confidence: 0.94 }`.
3. `src/services/mock/mock-payment.service.ts`:
   - When `ENABLE_MOCK_PAYMENT=true`:
     - Returns a local sandbox redirect URL: `http://localhost:${PORT}/api/v1/payments/mock-checkout?paymentId=${id}`.
     - Mock checkout route dispatches success IPN callback automatically after 2 seconds.
```

---

## Phase 3: NID KYC Verification & Minor Parental Consent Engine (Module 2)

### 🎯 Prompt 3.1: Google Cloud Vision OCR & S3 AES-256 Storage Service

```markdown
Act as a Cloud Security Architect. Implement secure NID document storage and OCR analysis services.

Requirements:
1. `src/services/storage.service.ts`:
   - AWS S3 / Cloud Storage integration:
     - Public bucket: Listing photos (WebP format, public CDN URL).
     - Private bucket: NID documents (AES-256 server-side encryption, no public access, presigned URLs with 15-minute expiration).
2. `src/services/ocr.service.ts`:
   - Google Cloud Vision API integration:
     - Calls `documentTextDetection` on uploaded NID images.
     - Parses Bengali and English text to extract Name, NID Number (10, 13, or 17 digits), and Date of Birth.
     - Calculates OCR confidence score.
3. Image Pre-processing Utility (`src/utils/image.ts`):
   - Uses `sharp` to strip EXIF metadata, auto-orient, and convert images to WebP format.
```

---

### 🎯 Prompt 3.2: NID Verification Workflow & Minor Parental Consent (<18)

```markdown
Act as a Senior Backend Developer. Implement the NID verification endpoints and BullMQ background OCR processing according to Module 2 of `api-spec.md`.

Requirements:
1. BullMQ `ocr-queue` Worker (`src/jobs/ocr.worker.ts`):
   - Processes uploaded NID asynchronously.
   - Hashes raw NID number with SHA-256 to create `nid_hash`.
   - Checks for duplicate NID in `NidVerification` collection. If duplicate exists, marks status `REJECTED` (`KYC_DUPLICATE_NID`).
   - If OCR confidence >= 0.85 and birthdate confirms age >= 18:
     - Sets user's `nid_status` to `APPROVED`, role to `VERIFIED_USER`.
   - If confidence < 0.85: routes to admin manual queue `PENDING_REVIEW`.
2. Adult NID Submission Controller (`POST /api/v1/kyc/nid/submit`):
   - Multi-part upload for front and back images.
   - Pushes job to `ocr-queue`, returns HTTP 202 Accepted.
3. Minor Parental Consent Endpoints (<18):
   - `POST /api/v1/kyc/minor/parental-consent`:
     - Takes guardian's phone number and guardian's NID number.
     - Enforces business rule: guardian can sponsor at most 2 minor accounts (`parent_user_id` query check).
     - Sends consent OTP to guardian's phone.
   - `POST /api/v1/kyc/minor/parental-consent/verify`:
     - Verifies guardian OTP. On success, updates user's role to `PARENT_VERIFIED_MINOR` and `nid_status` to `APPROVED`.
```

---

## Phase 4: Categories & Product Listings with Anti-Theft IMEI Gate (Modules 3 & 4)

### 🎯 Prompt 4.1: Category Taxonomy & Luhn IMEI Algorithm Utility

```markdown
Act as an Algorithm & API Specialist. Build the category taxonomy and anti-theft Luhn verification algorithm.

Requirements:
1. `src/utils/luhn.ts`:
   - Implement the Luhn (Mod 10) checksum validation algorithm for 15-digit smartphone IMEI numbers:
     - Double every second digit from right to left; if product > 9, subtract 9; sum all digits. Valid if sum % 10 === 0.
2. `src/modules/categories/`:
   - Seed default category tree from `database-schema.md` (Electronics -> Smartphones, Laptops, etc.).
   - Controller & Service: `GET /api/v1/categories` returning category hierarchy with required/optional fields.
   - Implement Redis caching (TTL: 1 hour) with automatic cache invalidation on category update.
```

---

### 🎯 Prompt 4.2: Product Listing Engine (Geo-Search, Pagination & Featured Boost)

```markdown
Act as a Database Query Optimization Specialist. Implement the listing search and discovery engine utilizing MongoDB Aggregation Pipelines as defined in `database.md` Section 6.1.

Requirements:
1. `src/modules/listings/listing.service.ts` (`searchListings`):
   - Accepts search filters: `keyword`, `category_slug`, `lat`, `lng`, `radius_km` (default 10), `min_price`, `max_price`, `condition`, `page`, `limit`.
   - Constructs MongoDB aggregation pipeline:
     1. `$geoNear` stage (spherical: true, maxDistance in meters) if coordinates are provided.
     2. `$lookup` seller details (`full_name`, `rating_average`, `nid_status`).
     3. `$sort`: Featured ads first (`is_featured: -1`), then proximity (`distance_meters: 1`), then recency (`created_at: -1`).
     4. `$facet` stage for paginated data and total count metadata in a single roundtrip.
2. Controller `GET /api/v1/listings`:
   - Validates query with Zod, returns paginated listings matching `api-spec.md` Section 4.1.
3. Controller `GET /api/v1/listings/:slug`:
   - Returns full listing details.
   - Uses Redis HyperLogLog (`pfadd listing:views:<id> <ip>`) to increment `views_count` accurately without duplicate spam within 20 seconds.
```

---

### 🎯 Prompt 4.3: Listing Creation with Anti-Theft IMEI Gate & Owner Update

```markdown
Act as a Senior Backend Developer. Implement listing creation and lifecycle operations according to Module 4 of `api-spec.md`.

Requirements:
1. Listing Creation (`POST /api/v1/listings`):
   - Auth guard: `NID_Verified` (User must be `VERIFIED_USER` or `PARENT_VERIFIED_MINOR`).
   - Category validation: If category requires `imei_number`, validate 15-digit numeric and Luhn checksum.
   - Anti-theft active duplicate check:
     - Query `Listing` for identical `imei_number` where status is in `ACTIVE`, `PENDING_REVIEW`, `RESERVED`.
     - If found, throw `409 Conflict` (`LISTING_IMEI_DUPLICATE_ACTIVE`).
   - Generate SEO-friendly unique slug from title and random 4-digit suffix.
   - Set expiration date to `Date.now() + 45 days`.
2. Listing Update (`PUT /api/v1/listings/:id`):
   - IDOR security check: Ensure `listing.seller_id.equals(req.user.id)`.
   - Security rule: Prevent modification of `imei_number` and `serial_number` once published.
```

---

## Phase 5: Privacy Shield, Phone Reveal & Real-time Messaging (Modules 5 & 6)

### 🎯 Prompt 5.1: Contact Privacy Shield & Rate-Limited Phone Unmasking Engine

```markdown
Act as a Zero-Trust Security Engineer. Build the Contact Privacy Shield that prevents bot scraping and enforces mandatory mutual NID verification before revealing seller phone numbers.

Requirements:
1. Contact Reveal Endpoint (`POST /api/v1/listings/:id/contact`):
   - Dual-NID Verification Gatekeeper:
     - Check buyer's `nid_status === 'APPROVED'`. If not, throw `403 Forbidden` (`PRIVACY_NID_VERIFICATION_REQUIRED`).
     - Check seller's `nid_status === 'APPROVED'`.
   - Rate-Limiting Counter (Redis):
     - Key: `contact_reveals:<buyer_id>:<YYYY-MM-DD>`.
     - Increment counter with 24-hour TTL.
     - If counter > 15, throw `429 Too Many Requests` (`PRIVACY_DAILY_LIMIT_EXCEEDED`).
   - Cryptographic One-Time Signature:
     - Generate HMAC-SHA256 token using `HMAC_CONTACT_SECRET`, buyer ID, and listing ID to prevent automated replay.
   - Log unmask event in `audit_logs` collection.
   - Return seller's unmasked phone number and remaining daily quota.
```

---

### 🎯 Prompt 5.2: In-App Chat, Socket.io with Redis & Anti-Bypass Regex Filter

```markdown
Act as a Real-time Communication Specialist. Implement WebSocket messaging using Socket.io, Redis Adapter, and anti-bypass contact filtering.

Requirements:
1. `src/modules/chats/chat.gateway.ts`:
   - Socket.io server with Redis Adapter (`@socket.io/redis-adapter`).
   - Authenticate socket handshake using JWT access token.
   - Events: `join_room`, `send_message`, `typing`, `message_delivered`, `message_read`.
2. Anti-Bypass Regex Filter (`src/utils/anti-bypass.ts`):
   - Detects attempts to share phone numbers in chat:
     - English digits (e.g. `017...`, `+8801...`).
     - Bengali digits (e.g. `০১৭১...`).
     - Disguised words (e.g. `zero one seven...`, `o 1 7 . . .`).
   - If phone number is detected, reject message with `400 Bad Request` (`CHAT_PHONE_NUMBER_FORBIDDEN`) and display warning to use the official "Call Seller" button.
3. Message Persistence Buffer:
   - Push valid messages to Redis buffer and dispatch via BullMQ `chat-persist-queue` for batch insertion into MongoDB `messages` collection.
4. Safe Meetup Zones (`GET /api/v1/chats/rooms/:roomId/safe-zones`):
   - Call Google Places API with listing coordinates to find nearest police station (`police`) and metro station (`transit_station`). Return top recommendations.
```

---

## Phase 6: Deal Finalization, ACID Transactions & Mutual Ratings (Module 7)

### 🎯 Prompt 6.1: Mark as Sold ACID Transaction & Chat Locking

```markdown
Act as a Principal Transaction Architect. Implement the atomic Deal Finalization workflow using MongoDB Multi-Document ACID Transactions as defined in `database.md` Section 7.1.

Requirements:
1. Transaction Implementation (`src/modules/listings/deal.service.ts`):
   - Method `completeDealTransaction(listingId, sellerId, buyerId)`:
     - Start Mongoose ClientSession and transaction.
     - Step 1: Update listing status to `SOLD` (verify `seller_id === sellerId` and current status in `ACTIVE`, `RESERVED`).
     - Step 2: Lock all associated chat rooms (`status = 'LOCKED'`).
     - Step 3: Insert two pending records into `ratings` collection:
       - Buyer -> Seller (`role_type: 'BUYER_TO_SELLER'`)
       - Seller -> Buyer (`role_type: 'SELLER_TO_BUYER'`)
       - Set `window_expires_at = Date.now() + 7 days`.
     - Step 4: Increment seller's `completed_deals_count` by 1 in `users` collection.
     - Step 5: Insert immutable audit log with action `DEAL_SOLD`.
     - Commit transaction and abort on any failure.
2. Controller `POST /api/v1/listings/:id/mark-sold`:
   - Validates input, executes transaction, dispatches notification to buyer.
```

---

### 🎯 Prompt 6.2: Mutual 1-5 Star Ratings Engine & Top Seller Badge Recalculation

```markdown
Act as a Reputation Systems Engineer. Implement the mutual rating and trust score recalculation pipeline.

Requirements:
1. Rating Submission (`POST /api/v1/ratings`):
   - Auth check: User must be either the buyer or seller of the completed deal.
   - Check `window_expires_at`: If current time > 7 days from sale, reject with `410 Gone` (`RATING_WINDOW_EXPIRED`).
   - Update score (1-5), comment (max 500 chars), and predefined tags.
2. Trust Score Recalculation Pipeline (`database.md` Section 6.2):
   - Trigger aggregation pipeline on review submission:
     - Calculate new `rating_average` and `rating_count` for the reviewee.
     - Evaluate "Top Seller" criteria: `average_rating >= 4.5` AND `completed_deals_count >= 5`.
     - Atomically update user document.
3. User Public Ratings (`GET /api/v1/ratings/users/:userId`):
   - Privacy Rule: Show rating score and reviews ONLY if user has received at least 3 ratings (`rating_count >= 3`).
```

---

## Phase 7: Post-Purchase Disputes, Fraud Investigation & Ban Engine (Module 8)

### 🎯 Prompt 7.1: 72-Hour Fraud Dispute Intake & Defendant Account Freezing

```markdown
Act as a Trust & Safety Engineer. Implement the post-purchase fraud logging and immediate risk mitigation engine.

Requirements:
1. Dispute Filing Endpoint (`POST /api/v1/disputes`):
   - Enforce 72-hour window: Check listing's `updated_at` (sold timestamp). If > 72 hours, throw `400 Bad Request` (`DISPUTE_WINDOW_EXPIRED`).
   - Reason category check: Must be one of `CLONE_DEVICE`, `ICLOUD_LOCKED`, `HARDWARE_FAULT`, `STOLEN_SUSPECT`, `MISLEADING_INFO`.
   - Validate evidence: Require at least 1 image URL (technician slip, diagnostic screenshot, GD copy).
2. Risk Mitigation Actions:
   - Create dispute ticket with status `OPEN`.
   - **Immediately freeze the defendant seller's account** (`is_frozen = true`) to prevent further fraudulent transactions while investigation is active.
   - Insert audit log and trigger high-priority alert in Admin review queue.
```

---

### 🎯 Prompt 7.2: Dispute Resolution ACID Transaction & 3-Strikes Ban System

```markdown
Act as a Compliance & Security Architect. Implement the dispute verdict resolution transaction as defined in `database.md` Section 7.2.

Requirements:
1. Admin Resolution Transaction (`src/modules/disputes/dispute-resolution.service.ts`):
   - Method `resolveDisputeTransaction(disputeId, verdict, adminId, resolutionNotes, ipAddress)`:
     - Verdict enum: `RESOLVED_BUYER_WIN`, `RESOLVED_SELLER_WIN`, `DISMISSED`.
     - Step 1: Update dispute record with verdict, admin ID, notes, and `resolved_at`.
     - Step 2: If `RESOLVED_BUYER_WIN`:
       - Increment seller's `strikes_count` by 1.
       - If `strikes_count >= 3`: Set `is_banned = true`, `is_frozen = false` (Permanent Ban).
       - Else: Unfreeze account (`is_frozen = false`).
     - Step 3: If `DISMISSED`:
       - Increment fraudulent complainant's `warnings_count` by 1.
       - Unfreeze seller's account (`is_frozen = false`).
     - Step 4: Dispatch in-app notifications to both parties.
     - Step 5: Save immutable audit log with action `DISPUTE_RESOLVED`.
2. Admin Controller `POST /api/v1/admin/disputes/:id/resolve`:
   - Auth guard: `Admin_Moderator` (L4).
```

---

## Phase 8: Payments, Monetization & IPN Webhook Handlers (Module 9)

### 🎯 Prompt 8.1: bKash & Nagad Payment Gateway SDK & Idempotent Initiation

```markdown
Act as a FinTech Integration Engineer. Implement monetization payment processing with strict idempotency controls.

Requirements:
1. Payment Initiation (`POST /api/v1/payments/initiate`):
   - Services offered:
     - `FEATURED_AD_3D` (৳99), `FEATURED_AD_7D` (৳199)
     - `URGENT_TAG` (৳49)
     - `EXPRESS_VERIFY` (৳29)
   - Idempotency Guard:
     - Require UUID `idempotency_key` in request body.
     - Check Redis key `idempotency:<key>`. If exists, return previous cached response to prevent double-charging.
     - Insert `Payment` record with status `PENDING`.
2. Payment Gateway Handshake:
   - Call bKash/Nagad PGW API to create payment URL and obtain gateway transaction session.
   - Return redirect URL to client with 10-minute validity.
```

---

### 🎯 Prompt 8.2: HMAC-SHA256 IPN Webhook Verification & Benefit Activation

```markdown
Act as a Payment Security Specialist. Build the Instant Payment Notification (IPN) webhook handlers for bKash and Nagad.

Requirements:
1. Webhook Handlers (`POST /api/v1/payments/webhook/bkash` & `/nagad`):
   - Extract raw payload and signature from header (`X-bKash-Signature`).
   - Verify HMAC-SHA256 signature using secret key. Reject with `401 Unauthorized` if signature mismatch.
   - Idempotent execution: Verify payment status in DB; if already `SUCCESS`, return 200 OK without re-executing.
2. Benefit Delivery:
   - On `SUCCESS`:
     - Update payment record to `SUCCESS` with `gateway_tx_id`.
     - If `FEATURED_AD`: Set `listing.is_featured = true` and `featured_expires_at = Date.now() + 3 or 7 days`.
     - If `URGENT_TAG`: Set `listing.is_urgent = true`.
     - If `EXPRESS_VERIFY`: Promote user's NID review to priority queue in Redis.
     - Insert transaction receipt in notifications and create audit log.
```

---

## Phase 9: Real-time Notifications & Background Maintenance Jobs (Module 10)

### 🎯 Prompt 9.1: Multi-Channel Notifications & Fast Polling Endpoint

```markdown
Act as a Real-time Services Engineer. Implement in-app notifications and background dispatchers.

Requirements:
1. Notification Service (`src/modules/notifications/notification.service.ts`):
   - Method `createNotification(userId, title, message, eventType, actionUrl)`:
     - Inserts record into `notifications` collection.
     - Emits real-time event via Socket.io to user's private channel (`user:<userId>`).
2. Endpoints:
   - `GET /api/v1/notifications`: Paginated list of notifications.
   - `GET /api/v1/notifications/unread-count`: Fast aggregation returning single integer `unread_count` for mobile/web polling badge.
   - `PATCH /api/v1/notifications/:id/read`: Mark single notification as read.
   - `PATCH /api/v1/notifications/mark-all-read`: Bulk update.
```

---

### 🎯 Prompt 9.2: BullMQ Maintenance Worker (30-Day NID Shredding & 45-Day Ad Expiry)

```markdown
Act as a Compliance & DevOps Engineer. Implement automated data lifecycle maintenance jobs using BullMQ on Redis.

Requirements:
1. `src/jobs/maintenance.worker.ts`:
   - Configure recurring cron job running daily at 02:00 AM BD time:
2. Task 1: 30-Day NID Cryptographic Shredding (PRD Compliance):
   - Query `NidVerification` where `verified_at < now - 30 days` and `is_image_purged === false`.
   - Delete original front and back images from private S3 bucket.
   - Delete AES encryption keys from Key Management.
   - Update `front_image_ref = null`, `back_image_ref = null`, `is_image_purged = true`. Retain ONLY `nid_hash` for duplicate prevention.
3. Task 2: 45-Day Listing Expiry:
   - Query `Listing` where `expires_at < now` and `status === 'ACTIVE'`.
   - Update status to `EXPIRED`. Release partial unique index hold on IMEI.
4. Task 3: 90-Day Chat Message Archiving:
   - Soft-delete messages older than 90 days (`is_archived = true`).
```

---

## Phase 10: Admin Backoffice Governance & Law Enforcement Compliance (Module 11)

### 🎯 Prompt 10.1: TOTP 2FA Admin Authentication & FIFO NID Review Queue

```markdown
Act as a Backoffice Security Engineer. Implement admin panel authentication and NID review workflows.

Requirements:
1. Admin 2FA Authentication:
   - Implement Time-based One-Time Password (TOTP) using `speakeasy` and `qrcode`.
   - Require admin login to supply username, password, and 6-digit TOTP code.
   - Enforce backoffice IP allowlist middleware.
2. FIFO Pending NID Review Queue (`GET /api/v1/admin/kyc/queue`):
   - Query pending NID submissions sorted by `created_at: 1` (FIFO).
   - Generate short-lived presigned S3 URLs (15-minute validity) for front and back images.
3. Admin NID Decision (`POST /api/v1/admin/kyc/:id/decision`):
   - Actions: `APPROVED` or `REJECTED` (with mandatory enum reason).
   - Atomically updates user's `nid_status` and sends notification SMS to user.
```

---

### 🎯 Prompt 10.2: Forensic Audit Trail & Law Enforcement Subpoena Compliance Export

```markdown
Act as a Legal & Forensic Security Engineer. Implement the law enforcement compliance export facility for Bangladesh Police investigations.

Requirements:
1. Subpoena Export Endpoint (`POST /api/v1/admin/compliance/subpoena-export`):
   - Auth guard: `Super_Admin` (L5) only.
   - Request inputs: `case_reference_number` (GD / FIR number), `requesting_authority`, `target_user_id`, `date_range_start`, `date_range_end`, `export_password`.
2. Archival Pipeline:
   - Collect user's full audit trail:
     - Profile and KYC history (masked NID, verification timestamps).
     - Published listings and IMEI transaction records.
     - In-app chat logs involving target user.
     - Immutable `audit_logs` (IP addresses, user agents, actions).
   - Package data into AES-256 password-protected ZIP archive using `archiver`.
   - Upload archive to private legal compliance bucket with 1-hour expiration.
   - Log forensic export event in `audit_logs` recording admin ID, GD number, and timestamp.
```

---

## Phase 11: End-to-End Integration Testing, Docker & Deployment

### 🎯 Prompt 11.1: Automated Integration Test Suite (Jest & Supertest)

```markdown
Act as a Senior QA Automation Engineer. Build the automated test suite covering all critical security and business logic gates.

Requirements:
1. Setup Jest and Supertest with in-memory MongoDB (`mongodb-memory-server`) and `ioredis-mock`.
2. Write integration test suites:
   - `auth.test.ts`: Registration OTP, login, session limits, JWT refresh.
   - `kyc.test.ts`: Adult NID submission, minor parental consent with 2-child limit.
   - `listing-anti-theft.test.ts`: Luhn algorithm validation, duplicate active IMEI rejection (409), relisting after sale.
   - `privacy-shield.test.ts`: Dual-NID check before unmasking phone, 15 reveal daily limit, phone regex block in chat.
   - `deal-transaction.test.ts`: ACID transaction on Mark as Sold, chat locking, 7-day rating window, 3-strike permanent ban on dispute win.
```

---

### 🎯 Prompt 11.2: Production Dockerization, NGINX Configuration & CI Pipeline

```markdown
Act as a DevOps & Cloud Infrastructure Engineer. Prepare the production containerization and deployment pipelines for Becha-Kena backend.

Requirements:
1. Multi-Stage `Dockerfile`:
   - Stage 1 (Builder): Node.js 20 Alpine, installs dependencies, compiles TypeScript to `dist/`.
   - Stage 2 (Runner): Minimal Alpine image, production dependencies only, non-root user (`USER node`), dumb-init.
2. `docker-compose.yml`:
   - Services: `backend-api`, `redis-master`, `nginx-proxy`.
3. `nginx.conf`:
   - Reverse proxy with rate limiting, SSL termination (TLS 1.3), Gzip compression, WebSocket proxying (`Upgrade` header for Socket.io), and security headers (HSTS, CSP, X-Frame-Options).
4. GitHub Actions Workflow (`.github/workflows/ci-cd.yml`):
   - Linting, TypeScript type-check, automated Jest testing, Docker image build, and security scanning with Trivy.
```

---

## 🏁 এক্সিকিউশন চেকলিস্ট (Master Execution Progress Tracker)

| ফেজ | মডিউল ও ফিচার | স্ট্যাটাস |
| :---: | :--- | :---: |
| **Phase 0** | Tooling, TypeScript, Zod Env, Health Checks, RFC 7807 Error Middlewares, Swagger UI (/api-docs) | ⬜ Pending |
| **Phase 1** | ১১টি কালেকশনের Mongoose মডেল, TypeScript ইন্টারফেস, স্পেশালাইজড ইনডেক্স ও সিডার স্ক্রিপ্ট (seed.ts) | ⬜ Pending |
| **Phase 2** | Dual-Token JWT, Redis ব্ল্যাকলিস্ট, SMS OTP, রুট, RBAC মিডলওয়্যার ও Mock Service Adapters | ⬜ Pending |
| **Phase 3** | Google Vision OCR, প্রাইভেট S3, BullMQ OCR কিউ, অপ্রাপ্তবয়স্ক প্যারেন্টাল গেট | ⬜ Pending |
| **Phase 4** | ক্যাটাগরি ট্রি, Luhn IMEI চেক, জিও-সার্চ ($geoNear), Featured Ad বুস্ট | ⬜ Pending |
| **Phase 5** | ডুয়েল-NID কন্টাক্ট শিল্ড (দৈনিক ১৫ সীমা), Socket.io চ্যাট ও Anti-Bypass Regex | ⬜ Pending |
| **Phase 6** | Mark as Sold মাল্টি-ডকুমেন্ট ট্রানজ্যাকশন, চ্যাট লক ও ৭ দিনের রেটিং সিস্টেম | ⬜ Pending |
| **Phase 7** | ৭২ ঘণ্টার ফ্রড ইনটেক, সেলার অটো-ফ্রিজ ও অ্যাডমিন ৩-স্ট্রাইক ব্যান ট্রানজ্যাকশন | ⬜ Pending |
| **Phase 8** | বিকাশ/নগদ পেমেন্ট ইনিশিয়েট (Idempotency) ও HMAC IPN ওয়েবহুক হ্যান্ডলার | ⬜ Pending |
| **Phase 9** | ইন-অ্যাপ নোটিফিকেশন সার্ভিস, ফাস্ট পোলিং ও ৩০-দিনের NID অটো-পার্জ ক্রন | ⬜ Pending |
| **Phase 10** | TOTP 2FA অ্যাডমিন লগইন, FIFO NID রিভিউ কিউ ও সাইবার পুলিশ ফরেনসিক এক্সপোর্ট | ⬜ Pending |
| **Phase 11** | Jest ইন্টিগ্রেশন টেস্ট সু্যট, মাল্টি-স্টেজ ডকার ও সিআই/সিডি অটোমেশন | ⬜ Pending |

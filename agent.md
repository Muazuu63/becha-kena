# বেচা-কেনা (Becha-Kena) — Master AI Agent Operational Instructions
**ডকুমেন্ট ভার্সন:** 1.0.0 (Master AI Blueprint)  
**স্ট্যাটাস:** স্থায়ী সিস্টেম ইন্সট্রাকশন ও নলেজ বেস  
**টার্গেট অডিয়েন্স:** যেকোনো এআই কোডিং অ্যাসিস্ট্যান্ট বা স্বায়ত্তশাসিত এজেন্ট (AI Pair Programmer / Autonomous Coding Agent)  
**রেফারেন্স ফাইলসমূহ:** `PRD.md`, `architecture.md`, `database-schema.md`, `database.md`, `api-spec.md`, `dfd.md`, `prompt.md`  

---

## ১. প্রজেক্ট পরিচিতি ও কোর ফিলোসফি (Project Identity & Core Philosophy)

**বেচা-কেনা (Becha-Kena)** হলো বাংলাদেশের প্রথম শতভাগ ভেরিফাইড C2C রিকমার্স মার্কেটপ্লেস (Verified Used Goods Marketplace)। প্ল্যাটফর্মটির মূল দর্শন হলো **"100% Zero Anonymity, Zero Advance Payment Scams, High Trust Recommerce"**।

### মূল নীতিসমূহ (Core Philosophies):
1. **শতভাগ পরিচয় নিশ্চিতকরণ (Mandatory Dual-NID):** প্ল্যাটফর্মে বেনামী কোনো ক্রেতা বা বিক্রেতা থাকতে পারবে না। বিক্রেতার ফোন নম্বর দেখা বা চ্যাট শুরু করার জন্য ক্রেতা ও বিক্রেতা উভয়কেই সরকার অনুমোদিত NID ভেরিফাইড হতে হবে।
2. **অ্যাডভান্স পেমেন্ট নিষিদ্ধ (Zero Advance Scam):** কুরিয়ার বা অগ্রিম ডেলিভারি চার্জের নামে প্রতারণা ঠেকাতে প্ল্যাটফর্মটি শুধুমাত্র **"পাবলিক সেফ জোনে ফিজিক্যাল মিটআপ এবং পণ্য হাতে পেয়ে সরাসরি লেনদেন"** সমর্থন করে।
3. **চোরাই পণ্য প্রতিরোধ (Anti-Theft Protocol):** স্মার্টফোন লিস্টিংয়ে ১৫ ডিজিটের Luhn-ভ্যালিডেটেড IMEI বাধ্যতামূলক এবং ল্যাপটপে সিরিয়াল নম্বর আবশ্যক। সক্রিয় অবস্থায় একই IMEI ডুপ্লিকেট তালিকাভুক্তি অসম্ভব।

---

## ২. সোর্স অফ ট্রুথ হায়ারার্কি (Documentation Hierarchy)

কোনো রিকোয়ারমেন্ট বা লজিকে অস্পষ্টতা বা দ্বন্দ্ব দেখা দিলে নিচের অগ্রাধিকার অনুযায়ী সিদ্ধান্ত নিতে হবে:

1. **[`PRD.md`](./PRD.md):** চূড়ান্ত ব্যবসায়িক সিদ্ধান্ত, কোর ইউজার ফ্লো ও P0/P1/P2 রিকোয়ারমেন্টস।
2. **[`architecture.md`](./architecture.md):** সিস্টেমের প্রযুক্তিগত স্থাপত্য, টেক স্ট্যাক, সিকিউরিটি আর্কিটেকচার ও ক্লাউড অবকাঠামো।
3. **[`database-schema.md`](./database-schema.md) ও [`database.md`](./database.md):** কালেকশন ডেফিনিশন, ফিল্ড টাইপ, ইনডেক্সিং, ভ্যালিডেশন এবং ACID ট্রানজ্যাকশন।
4. **[`api-spec.md`](./api-spec.md):** এন্ডপয়েন্ট পাথ, মেথড, রিকোয়েস্ট/রেসপন্স স্ট্রাকচার, অথেনটিকেশন ম্যাট্রিক্স এবং RFC 7807 এরর কোড।
5. **[`dfd.md`](./dfd.md):** সাব-প্রসেস ডেটা প্রবাহ ও ডেটা ডিকশনারি।
6. **[`prompt.md`](./prompt.md):** ব্যাকএন্ড কোড তৈরির ধাপে ধাপে সাজানো এক্সিকিউশন প্রম্পটস।

---

## ৩. ১০টি অলঙ্ঘনীয় গোল্ডেন রুলস (The 10 Invariant Golden Rules)

যেকোনো এআই এজেন্টকে কোড লেখার সময় নিচের ১০টি নিয়ম কঠোরভাবে মেনে চলতে হবে। এই নিয়মগুলোর কোনো ব্যতিক্রম গ্রহণযোগ্য নয়:

| ক্রম | গোল্ডেন রুল | প্রযুক্তিগত এনফোর্সমেন্ট |
| :---: | :--- | :--- |
| **১** | **Dual-NID Privacy Shield** | বায়ার এবং সেলার — উভয়ের `nid_status === 'APPROVED'` না হলে বিক্রেতার আসল ফোন নম্বর প্রকাশ (`unmask`) করা যাবে না এবং চ্যাট শুরু করা যাবে না। |
| **২** | **Anti-Bypass Regex Guard** | চ্যাট মেসেজে সরাসরি ইংরেজি বা বাংলা ডিজিট, ছদ্মবেশী বানান (e.g. "zero one seven...", "০১৭১...") শনাক্ত হলে মেসেজ ব্লক করতে হবে (`CHAT_PHONE_NUMBER_FORBIDDEN`)। |
| **৩** | **Phone Reveal Rate Limit** | একজন ভেরিফাইড বায়ার দিনে সর্বোচ্চ **১৫ বার** ফোন নম্বর রিভিলের অনুরোধ করতে পারবেন (Redis Counter + HMAC ওয়ান-টাইম সাইন)। |
| **৪** | **Anti-Theft IMEI Gate** | স্মার্টফোনের ক্ষেত্রে ১৫-ডিজিটের Luhn (Mod 10) চেকসাম পাস করতে হবে এবং MongoDB Partial Unique Index (`ACTIVE`, `PENDING_REVIEW`, `RESERVED`) দ্বারা সক্রিয় ডুপ্লিকেট IMEI ব্লক করতে হবে। |
| **৫** | **Multi-Document ACID Transactions** | `Mark as Sold` (ডিল সম্পন্ন) এবং `Dispute Resolution` (রায় প্রদান ও স্ট্রাইক) অপারেশন অবশ্যই MongoDB ClientSession ট্রানজ্যাকশনের মধ্যে অ্যাটমিকভাবে সম্পন্ন হতে হবে। |
| **৬** | **30-Day NID Cryptographic Shredding** | NID কার্ডের আসল ছবি অনুমোদনের ৩০ দিন পর প্রাইভেট বাকেট এবং AES কি-স্টোর থেকে ক্রিপ্টোগ্রাফিকালি মুছে ফেলতে হবে। শুধুমাত্র SHA-256 `nid_hash` ডেটাবেজে সংরক্ষিত থাকবে। |
| **৭** | **72-Hour Fraud Dispute & Auto-Freeze** | বিক্রয়ের ৭২ ঘণ্টার মধ্যে ক্রেতা ফ্রড রিপোর্ট করতে পারবেন। অভিযোগ দায়ের হওয়ামাত্র অভিযুক্ত বিক্রেতার অ্যাকাউন্ট তাৎক্ষণিক সাময়িক ফ্রিজ (`is_frozen = true`) হবে। |
| **৮** | **3-Strikes Permanent Ban** | কোনো বিক্রেতার বিরুদ্ধে ৩টি ফ্রড ডিসপিউট প্রমাণিত হলে স্বয়ংক্রিয়ভাবে তার অ্যাকাউন্ট স্থায়ী বহিষ্কার (`is_banned = true`) হবে। |
| **৯** | **Idempotent Payments & HMAC Webhooks** | যেকোনো পেমেন্ট ইনিশিয়েশনে UUID `idempotency_key` বাধ্যতামূলক এবং bKash/Nagad IPN কলব্যাকে HMAC-SHA256 সিগনেচার যাচাই বাধ্যতামূলক। |
| **১০** | **Unified RFC 7807 Error Standard** | কোনো কাস্টম আনস্ট্রাকচার্ড এরর রিটার্ন করা যাবে না। প্রতিটি এরর `AppError` ক্লাসের মাধ্যমে RFC 7807 ফরম্যাটে (`type, title, status, detail (বাংলায়), code, errors[]`) রিটার্ন করতে হবে। |

---

## ৪. প্রযুক্তিগত স্ট্যাক ও লাইব্রেরি স্ট্যান্ডার্ড (Tech Stack Standards)

* **রানটাইম ও ফ্রেমওয়ার্ক:** Node.js (v20+ LTS) + Express.js (v4.x/5.x) + TypeScript (v5.x, `strict: true`)
* **ডেটাবেজ ও ওডিএম:** MongoDB Atlas (v7.0+) + Mongoose (v8.x)
* **ক্যাশিং ও কিউ প্রসেসর:** Redis Cluster (v7.x) + `ioredis` + `BullMQ` (v5.x)
* **রিয়েল-টাইম ইঞ্জিন:** Socket.io (v4.x) সাথে `@socket.io/redis-adapter`
* **ইনপুট ভ্যালিডেশন:** Zod (v3.x) — রিকোয়েস্ট বডি, কুয়েরি ও এনভায়রনমেন্ট ভ্যারিয়েবলের জন্য
* **পাসওয়ার্ড ও হ্যাশিং:** `@node-rs/argon2` অথবা `bcryptjs`
* **টোকেনাইজেশন:** `jsonwebtoken` (Dual-Token: Access 15m, Refresh 7d HttpOnly Cookie)
* **লগিং ও মনিটরিং:** `pino` (JSON Structured Logger) + `pino-pretty` (Dev)
* **ক্লাউড ও থার্ড-পার্টি সার্ভিসেস:**
  - Google Cloud Vision API (`@google-cloud/vision`) — OCR ও টেম্পারিং ডিটেকশন
  - Google Places API — সেফ মিটআপ জোন রিকমেন্ডেশন
  - Google reCAPTCHA v3 — বট অ্যাটাক প্রিভেনশন
  - AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
  - SSL Wireless / GP SMS API — টেলকো ওটিপি গেটওয়ে

---

## ৫. আর্কিটেকচারাল প্যাটার্ন ও কোডিং কনভেনশন (Coding Conventions)

### ৫.১ Layered Monolith ডিরেক্টরি কাঠামো
যেকোনো ফিচার যোগ করার সময় কোড অবশ্যই নিচের লেয়ারিং মেনে চলতে হবে:

```
src/
├── config/             # DB, Redis, Env, AWS S3, Google Clients
├── constants/          # Enums, Error Codes, Regex Patterns
├── middlewares/        # auth.middleware, error.middleware, validate.middleware, rate-limit
├── modules/            # ডোমেনভিত্তিক সেলফ-কনটেইন্ড মডিউল
│   ├── auth/           # auth.routes -> auth.controller -> auth.service -> user.model
│   ├── kyc/            # kyc.routes -> kyc.controller -> kyc.service -> nid-verification.model
│   ├── categories/     # categories.routes -> categories.controller -> category.model
│   ├── listings/       # listings.routes -> listings.controller -> listing.service -> listing.model
│   ├── chats/          # chat.routes, chat.gateway.ts, chat.service, chat-room.model
│   ├── ratings/        # rating.routes -> rating.controller -> rating.service -> rating.model
│   ├── disputes/       # dispute.routes -> dispute.controller -> dispute-resolution.service
│   ├── payments/       # payment.routes -> payment.controller -> bkash.service, nagad.service
│   ├── notifications/  # notification.routes -> notification.service -> notification.model
│   └── admin/          # admin.routes -> admin.controller -> compliance.service
├── jobs/               # BullMQ Queues (ocr.worker.ts, maintenance.worker.ts)
├── utils/              # luhn.ts, anti-bypass.ts, app-error.ts, logger.ts
├── app.ts              # Express App setup & middleware pipeline
└── server.ts           # HTTP & Socket.io server startup & graceful shutdown
```

### ৫.২ কোডিং রুলস ও বেস্ট প্র্যাকটিস
1. **Never use `any`:** সমস্ত অবজেক্ট, ফাংশন প্যারামিটার ও রিটার্ন টাইপে স্ট্রং টাইপ বা জেনেরিক ইন্টারফেস ব্যবহার করতে হবে।
2. **Skinny Controllers, Fat Services:** কন্ট্রোলারের কাজ শুধুমাত্র রিকোয়েস্ট রিসিভ করা, Zod দিয়ে ভ্যালিডেট করা এবং সার্ভিস মেথড কল করে ইউনিফাইড রেসপন্স দেওয়া। সমস্ত বিজনেস লজিক, ট্রানজ্যাকশন ও ক্যালকুলেশন সার্ভিসে থাকবে।
3. **Async / Await Error Propagation:** কন্ট্রোলারের ফাংশনগুলো `express-async-handler` বা ট্রাই-ক্যাচ দিয়ে আবৃত থাকবে এবং প্রতিটি ত্রুটি `next(error)` অথবা `throw new AppError(...)` দ্বারা গ্লোবাল এরর মিডলওয়্যারে পাঠাতে হবে।
4. **Database Naming Convention:**
   - কালেকশনের নাম প্লুরাল এবং `snake_case` (e.g. `users`, `nid_verifications`, `chat_rooms`)।
   - ডকুমেন্টের সমস্ত ফিল্ড `snake_case` (e.g. `phone_number`, `created_at`, `imei_number`)।
   - ফরেন কি ফিল্ডে সবসময় `_id` সাফিক্স থাকবে (e.g. `seller_id`, `buyer_id`, `listing_id`)।
5. **No Direct Hardcoding:** কোনো সিক্রেট, এপিআই কি, বা কনফিগারেশন হার্ডকোড করা যাবে না; সর্বদা `src/config/env.ts` থেকে টাইপ-সেফ এনভায়রনমেন্ট ভ্যারিয়েবল ব্যবহার করতে হবে।

---

## ৬. কমন পিটফলস ও টেকনিক্যাল ট্র্যাপস (Common Pitfalls & Gotchas to Avoid)

যেকোনো এআই এজেন্ট কোড লেখার সময় নিচের ভুলগুলো প্রায়ই করে থাকে; এগুলো কঠোরভাবে এড়াতে হবে:

1. **GeoJSON স্থানাঙ্কের ক্রম (Coordinate Ordering Trap):**  
   * MongoDB `2dsphere` ইনডেক্সে GeoJSON পয়েন্টের ফরম্যাট অবশ্যই **`[longitude, latitude]`** হতে হবে (e.g. `[90.3742, 23.7465]`)।  
   * ⚠️ কখনো গুগল ম্যাপের সাধারণ ক্রম `[latitude, longitude]` পাস করা যাবে না; অন্যথায় জিও-সার্চ ও `$geoNear` সম্পূর্ণ ব্যর্থ হবে।
2. **MongoDB ট্রানজ্যাকশন সেশন লিক (Session Leak Trap):**  
   * যেকোনো Multi-Document ACID ট্রানজ্যাকশনে `session.startTransaction()` ব্যবহারের পর অবশ্যই `finally` ব্লকে `session.endSession()` কল করতে হবে। তা না হলে ডাটাবেজ কানেকশন পুল খুব দ্রুত এক্সহস্ট হয়ে সার্ভার ক্র্যাশ করবে।
3. **Partial Unique Index কুয়েরি মিসম্যাচ:**  
   * `imei_number`-এর ডুপ্লিকেট চেকের সময় কুয়েরিতে অবশ্যই `status: { $in: ['ACTIVE', 'PENDING_REVIEW', 'RESERVED'] }` উল্লেখ করতে হবে, যাতে MongoDB পার্শিয়াল ইনডেক্স ব্যবহার করতে পারে।
4. **বাংলাদেশী ফোন নম্বর নরমালাইজেশন:**  
   * ইনপুটে ব্যবহারকারী `01712...`, `8801712...` বা `+8801712...` যেভাবেই দিক না কেন, ডেটাবেজে সেভ বা ভ্যালিডেশন চেকের পূর্বে তা বাধ্যতামূলকভাবে আন্তর্জাতিক স্ট্যান্ডার্ড **`+8801[3-9]\d{8}`** ফরম্যাটে নরমালাইজ করতে হবে।
5. **ইন-মেমোরি টোকেন বনাম কুকি:**  
   * ১৫ মিনিটের শর্ট-লিভড Access Token ক্লায়েন্ট মেমোরিতে (বা Authorization Header) থাকবে। কিন্তু ৭ দিনের Refresh Token কখনোই লোকাল স্টোরেজে রাখা যাবে না; এটি সর্বদা `HttpOnly; Secure; SameSite=Strict` কুকিতে থাকবে।

---

## ৭. লোকাল ডেভেলপমেন্ট ও মক অ্যাডাপ্টার স্ট্র্যাটেজি (Mock Adapters for AI Dev)

এআই এজেন্ট যখন একা কোড লিখবে বা টেস্ট রান করবে, তখন তার কাছে আসল SSL Wireless SMS গেটওয়ে, Google Cloud Vision বিলিং অ্যাকাউন্ট বা bKash মার্চেন্ট অ্যাকাউন্ট থাকবে না। সেই জন্য সিস্টেমটিতে **Mock Service Adapter Pattern** থাকতে হবে:

* **`MOCK_SMS=true` (Local / Test Mode):**  
  আসল টেলকো গেটওয়েতে রিকোয়েস্ট না পাঠিয়ে কনসোলে এবং লগে ওটিপি প্রিন্ট করবে (`[MOCK SMS] OTP for +88017... is 123456`), যাতে এআই সাইন-আপ ও লগইন ফ্লো অনায়াসে টেস্ট করতে পারে।
* **`MOCK_OCR=true`:**  
  Google Vision ক্লাউড এপিআই কল বাইপাস করে আপলোড করা ফাইলের নাম বা টেস্ট ইমেজ অনুযায়ী ডিটারমিনিস্টিক OCR ডেটা রিটার্ন করবে (নাম, জন্মতারিখ ও ৯৫% কনফিডেন্স স্কোর)।
* **`MOCK_PAYMENT=true`:**  
  bKash/Nagad গেটওয়ের পরিবর্তে লোকাল কলব্যাক সিমুলেশন লিঙ্ক প্রদান করবে, যা নিমেষে সফল পেমেন্ট ও IPN ওয়েবহুক ট্রিগার করতে পারে।

---

## ৮. গিট কমিট ও প্যাকেজ স্ক্রিপ্টস স্ট্যান্ডার্ড (Git & NPM Scripts)

### ৮.১ স্ট্যান্ডার্ড স্ক্রিপ্টস (`package.json`)
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "ts-node src/scripts/seed.ts",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### ৮.২ Conventional Git Commits
যেকোনো এআই এজেন্ট প্রতিটি ফেজ শেষে নিচের স্ট্যান্ডার্ডে কমিট করবে:
* `feat(auth): implement dual-token jwt with redis blacklist`
* `feat(listing): add geo-search and luhn imei validation`
* `fix(privacy): patch phone number regex filter for disguised digits`
* `test(deal): add integration tests for mark-as-sold acid transaction`

---

## ৯. এক্সিকিউশন ও ডেভেলপমেন্ট প্রটোকল (Step-by-Step Delivery Protocol)

ভবিষ্যতে যখন কোনো এআই এজেন্ট এই প্রজেক্টে কাজ করবে, তখন তাকে নিচের প্রটোকলটি অনুসরণ করতে হবে:

1. **ফাইল রেফারেন্স যাচাই:** কাজ শুরু করার আগে `prompt.md`-এর সংশ্লিষ্ট প্রম্পটটি মনোযোগ দিয়ে পড়তে হবে এবং প্রম্পটে উল্লিখিত ফাইলগুলো পরীক্ষা করতে হবে।
2. **এক সময়ে একটি ফেজ:** একসাথে একাধিক ফেজ বা মডিউল শুরু না করে `prompt.md`-এর ক্রম অনুযায়ী (Phase 0 থেকে Phase 11) একটি একটি করে সম্পন্ন করতে হবে।
3. **কনগ্রুয়েন্স ও রিগ্রেশন অডিট:** একটি ফেজ সম্পন্ন হলে দেখতে হবে তা `api-spec.md` এবং `database-schema.md`-এর সাথে শতভাগ মিলেছে কি না এবং বিদ্যমান কোনো ফিচার ক্ষতিগ্রস্ত হয়েছে কি না।
4. **ইন্টিগ্রেশন টেস্ট:** প্রতিটি গুরুত্বপূর্ণ নিরাপত্তা ফিচার (যেমন: ডুয়েল NID চেক, Luhn IMEI চেক, চ্যাট নম্বর ব্লকিং, মার্ক অ্যাজ সোল্ড ট্রানজ্যাকশন) তৈরির পর Jest/Supertest দিয়ে টেস্ট নিশ্চিত করতে হবে।

---

> [!IMPORTANT]
> **AI Agent Memory Anchor:**  
> এই প্রজেক্টটি কোনো সাধারণ ক্লাসিফায়েড ওয়েবসাইট নয়। এটি বাংলাদেশে প্রতারণা শূন্যে নামিয়ে আনার জন্য নির্মিত একটি **NID-লকড হাইপার-ট্রাস্টেড প্ল্যাটফর্ম**। যেকোনো ফিচার বিল্ড করার সময় সিকিউরিটি, ইউজার ভেরিফিকেশন এবং অ্যান্টি-ফ্রড লজিককে সর্বোচ্চ অগ্রাধিকার দিতে হবে।

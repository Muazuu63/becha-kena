# বেচা-কেনা (Becha-Kena) — RESTful API Specification
**ডকুমেন্ট ভার্সন:** 1.0.0 (Production API Master)  
**স্ট্যাটাস:** অনুমোদিত প্রোডাকশন এপিআই স্পেসিফিকেশন  
**প্রোটোকল:** HTTPS / RESTful API (JSON Payload)  
**বেস URL:** `https://api.becha-kena.com/api/v1`  
**রেফারেন্স ফাইলসমূহ:** `PRD.md`, `architecture.md`, `database-schema.md`, `database.md`, `dfd.md`  

---

## সূচিপত্র (Table of Contents)

1. [গ্লোবাল স্ট্যান্ডার্ড ও অথেনটিকেশন আর্কিটেকচার](#১-গ্লোবাল-স্ট্যান্ডার্ড-ও-অথেনটিকেশন-আর্কিটেকচার)
   - [১.১ অথেনটিকেশন লেভেল ম্যাট্রিক্স (Auth Matrix)](#১১-অথেনটিকেশন-লেভেল-ম্যাট্রিক্স-auth-requirement-matrix)
   - [১.২ রিকোয়েস্ট ও রেসপন্স হেডার](#১২-রিকোয়েস্ট-ও-রেসপন্স-হেডার)
   - [১.৩ এপিআই ভার্সন কন্ট্রোল ও ডেপ্রিকেশন পলিসি (API Version Control)](#১৩-এপিআই-ভার্সন-কন্ট্রোল-ও-ডেপ্রিকেশন-পলিসি-api-version-control)
   - [১.৪ পূর্ণাঙ্গ এরর হ্যান্ডলিং ফ্রেমওয়ার্ক (RFC 7807 & Error Taxonomy)](#১৪-পূর্ণাঙ্গ-এরর-হ্যান্ডলিং-ফ্রেমওয়ার্ক-rfc-7807--error-taxonomy)
2. [Module 1: Authentication & Session Management](#module-1-authentication--session-management)
3. [Module 2: NID KYC Verification & Minor Parental Gate](#module-2-nid-kyc-verification--minor-parental-gate)
4. [Module 3: Category & Taxonomy Management](#module-3-category--taxonomy-management)
5. [Module 4: Product Listings & Anti-Theft IMEI Gate](#module-4-product-listings--anti-theft-imei-gate)
6. [Module 5: Contact Privacy Shield & Phone Reveal](#module-5-contact-privacy-shield--phone-reveal)
7. [Module 6: In-App Messaging & Safe Meetup Zones](#module-6-in-app-messaging--safe-meetup-zones)
8. [Module 7: Deal Finalization & Mutual Ratings](#module-7-deal-finalization--mutual-ratings)
9. [Module 8: Post-Purchase Disputes & Fraud Investigation](#module-8-post-purchase-disputes--fraud-investigation)
10. [Module 9: Payments, Monetization & IPN Webhooks](#module-9-payments-monetization--ipn-webhooks)
11. [Module 10: In-App Notifications](#module-10-in-app-notifications)
12. [Module 11: Admin Governance & Law Enforcement Compliance](#module-11-admin-governance--law-enforcement-compliance)

---

## ১. গ্লোবাল স্ট্যান্ডার্ড ও অথেনটিকেশন আর্কিটেকচার

### ১.১ অথেনটিকেশন লেভেল ম্যাট্রিক্স (Auth Requirement Matrix)

| লেভেল কোড | লেভেলের নাম | অথেনটিকেশন মেকানিজম | অনুমোদিত ভূমিকা (Roles) | প্রযোজ্য কার্যক্রম |
| :---: | :--- | :--- | :--- | :--- |
| **L0** | `Public` | কোনো টোকেন আবশ্যক নয় | Guest, Any Client | বিজ্ঞাপন ব্রাউজ, ক্যাটাগরি ভিউ, সাইন-আপ, লগইন |
| **L1** | `Authenticated` | Bearer Access Token (15m) | `UNVERIFIED_USER`, `PARENT_VERIFIED_MINOR`, `VERIFIED_USER`, `MODERATOR`, `SUPER_ADMIN` | NID আপলোড, নিজের প্রোফাইল দেখা, নোটিফিকেশন ভিউ |
| **L2** | `NID_Verified` | Bearer Token + `nid_status: APPROVED` | `VERIFIED_USER`, `PARENT_VERIFIED_MINOR` | বিজ্ঞাপন পোস্ট, সেলারকে কল/নম্বর আনমাস্ক, চ্যাট শুরু |
| **L3** | `Deal_Participant` | L2 + সংশ্লিষ্ট লিস্টিংয়ের বিক্রেতা বা ক্রেতা | `VERIFIED_USER` | Mark as Sold, রেটিং সাবমিট, ফ্রড ডিসপিউট ওপেন |
| **L4** | `Admin_Moderator` | Bearer Token + TOTP 2FA + Backoffice IP | `MODERATOR`, `SUPER_ADMIN` | NID রিভিউ, লিস্টিং টেইকডাউন, ডিসপিউট নিষ্পত্তি |
| **L5** | `Super_Admin` | L4 + Super Admin Scope | `SUPER_ADMIN` | ব্যবহারকারী ব্যান, সিস্টেম কনফিগ, জিডি/পুলিশি সাবপিনা এক্সপোর্ট |

### ১.২ রিকোয়েস্ট ও রেসপন্স হেডার

* **সাধারণ রিকোয়েস্ট হেডার:**
  ```http
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer <jwt-access-token>
  X-Client-Version: 1.0.0
  X-Device-Fingerprint: <sha256-device-hash>
  ```
* **রেসপন্স ফরম্যাট:** সমস্ত সাকসেস রেসপন্স standard wrapper এ আবদ্ধ:
  ```json
  {
    "success": true,
    "status": 200,
    "data": { ... },
    "meta": { "timestamp": "2026-10-21T18:00:00.000Z" }
  }
  ```

### ১.৩ এপিআই ভার্সন কন্ট্রোল ও ডেপ্রিকেশন পলিসি (API Version Control Strategy)

প্ল্যাটফর্মের ব্যাকওয়ার্ড কম্প্যাটিবিলিটি এবং মোবাইল ও ওয়েব ক্লায়েন্টের নিরবচ্ছিন্ন সেবা নিশ্চিত করতে নিচের ভার্সনিং ফ্রেমওয়ার্ক প্রযোজ্য:

#### ১.৩.১ ভার্সনিং স্ট্র্যাটেজি (URI Path Versioning)
* **বেস রাউটিং:** এপিআই-এর প্রতিটি মেথড নির্দিষ্ট মেজর ভার্সন প্রিফিক্স দিয়ে শুরু হয় (বর্তমানে `/api/v1/*` প্রোডাকশনে সক্রিয়)।
* **সেম্যান্টিক ভার্সনিং (SemVer):** এপিআই `MAJOR.MINOR.PATCH` ফরম্যাট মেনে চলে:
  - **MAJOR (ব্রেকিং পরিবর্তন):** ফিল্ড মুছে ফেলা, রেসপন্স ফরম্যাটে কাঠামোগত পরিবর্তন, বা নতুন আবশ্যক ফিল্ড সংযোজন হলে নতুন এন্ডপয়েন্ট ভার্সন চালু হবে (e.g. `/api/v2/*`)।
  - **MINOR (নন-ব্রেকিং বর্ধন):** নতুন অপশনাল ফিল্ড, নতুন এন্ডপয়েন্ট বা নতুন কুয়েরি প্যারামিটার যুক্ত হলে ভার্সন পাথ একই থাকবে।
  - **PATCH (বাগ ফিক্স):** ইন্টারনাল লজিক ও বাগ ফিক্সে কোনো এপিআই পাথ বা কন্ট্রাক্ট পরিবর্তিত হবে না।

#### ১.৩.২ ক্লায়েন্ট ভার্সন ট্র্যাকিং ও এনফোর্সমেন্ট
* ক্লায়েন্ট অ্যাপ্লিকেশনকে প্রতিটি রিকোয়েস্টে নিচের হেডার প্রদান করতে হবে:
  ```http
  X-Client-Version: 1.2.0
  X-Client-Platform: iOS | Android | Web
  ```
* **ম্যান্ডেটরি আপগ্রেড (`426 Upgrade Required`):** কোনো পুরনো অ্যাপ ভার্সনে মারাত্মক সিকিউরিটি ত্রুটি বা সানসেট হওয়া এপিআই ব্যবহৃত হলে গেটওয়ে সরাসরি `HTTP 426` রেসপন্স রিটার্ন করবে:
  ```json
  {
    "type": "https://api.becha-kena.com/errors/upgrade-required",
    "title": "Upgrade Required",
    "status": 426,
    "detail": "আপনার অ্যাপের ভার্সনটি মেয়াদোত্তীর্ণ। নিরাপদ কেনাবেচার জন্য অনুগ্রহ করে অ্যাপ স্টোর থেকে আপডেট করুন।",
    "code": "CLIENT_UPGRADE_REQUIRED",
    "min_supported_version": "2.0.0",
    "upgrade_url": "https://play.google.com/store/apps/details?id=com.bechakena.app"
  }
  ```

#### ১.৩.৩ ডেপ্রিকেশন লাইফসাইকেল ও সানসেট পলিসি (IETF Standards)
* কোনো সক্রিয় এপিআই ভার্সন বা এন্ডপয়েন্ট পরিবর্তনের পূর্বে কমপক্ষে **১৮০ দিন (৬ মাস)** ডেপ্রিকেশন নোটিশ বজায় রাখা বাধ্যতামূলক।
* ডেপ্রিকেটেড এন্ডপয়েন্টের সমস্ত রেসপন্সে IETF ড্রাফট অনুযায়ী স্ট্যান্ডার্ড হেডার অন্তর্ভুক্ত হবে:
  ```http
  Deprecation: @1792627200
  Sunset: Wed, 21 Oct 2027 00:00:00 GMT
  Link: <https://api.becha-kena.com/api/v2/listings>; rel="successor-version"
  ```

---

### ১.৪ পূর্ণাঙ্গ এরর হ্যান্ডলিং ফ্রেমওয়ার্ক (RFC 7807 & Error Taxonomy)

প্ল্যাটফর্মের প্রতিটি এরর রেসপন্স **RFC 7807 (Problem Details for HTTP APIs)** স্পেসিফিকেশন কঠোরভাবে অনুসরণ করে। এর ফলে মোবাইল এবং ওয়েব ফ্রন্টএন্ড সহজে প্রোগ্রামাটিক এরর হ্যান্ডলিং ও ইউজার ফ্রেন্ডলি মেসেজ রেন্ডার করতে পারে।

#### ১.৪.১ এরর অবজেক্ট স্কিমা ডেফিনিশন

```json
{
  "type": "https://api.becha-kena.com/errors/<error-category>",
  "title": "<Short Human-Readable Summary>",
  "status": 400,
  "detail": "<Localized explanation in Bengali for the user>",
  "instance": "/api/v1/<request-path>",
  "code": "<DOMAIN_SPECIFIC_ERROR_CODE>",
  "errors": [
    {
      "field": "<field_name>",
      "message": "<Validation failure message>",
      "rule": "<validation_rule_violated>"
    }
  ],
  "trace_id": "req-9843a-7bc2-11ef",
  "timestamp": "2026-10-21T18:15:00.000Z"
}
```

| ফিল্ডের নাম | ধরন | বিবরণ |
| :--- | :--- | :--- |
| `type` | String (URI) | সমস্যার প্রকারভেদ সম্পর্কিত ডকুমেন্টেশন ইউআরআই। |
| `title` | String | এইচটিটিপি স্ট্যাটাস ভিত্তিক সংক্ষিপ্ত ইংরেজি শিরোনাম। |
| `status` | Integer | সংশ্লিষ্ট HTTP রেসপন্স স্ট্যাটাস কোড (e.g. 400, 401, 403, 409)। |
| `detail` | String | ব্যবহারকারীকে সরাসরি প্রদর্শনের উপযোগী স্পষ্ট বাংলা বিবরণ। |
| `instance` | String | যে এন্ডপয়েন্ট বা রিসোর্সে ত্রুটি ঘটেছে তার আপেক্ষিক পাথ। |
| `code` | String | ফ্রন্টএন্ড লজিকের জন্য ক্যাপিটালাইজড ইউনিক মেশিন-রিডেবল এরর কোড। |
| `errors` | Array of Object | ইনপুট ভ্যালিডেশন ব্যর্থ হলে প্রতিটি ফিল্ডের ত্রুটির তালিকা (ঐচ্ছিক)। |
| `trace_id` | String | Sentry ও সার্ভার লগে সমস্যা অনুসন্ধানের ইউনিক রিকোয়েস্ট আইডি। |
| `timestamp` | Date (ISO) | ত্রুটি সংঘটিত হওয়ার অবিকৃত সময়। |

---

#### ১.৪.২ ভ্যালিডেশন এরর রেসপন্স উদাহরণ (Zod Validation Failure)

যখন ব্যবহারকারী লিস্টিং ফর্মে অবৈধ IMEI বা ইনপুট প্রদান করবেন:

```json
{
  "type": "https://api.becha-kena.com/errors/validation-error",
  "title": "Request Validation Failed",
  "status": 400,
  "detail": "প্রদত্ত ইনপুট তথ্যে ভুল রয়েছে। অনুগ্রহ করে লাল চিহ্নিত ফিল্ডগুলো সংশোধন করুন।",
  "instance": "/api/v1/listings",
  "code": "VALIDATION_FAILED",
  "errors": [
    {
      "field": "imei_number",
      "message": "স্মার্টফোন ক্যাটাগরিতে ১৫-ডিজিটের বৈধ IMEI নম্বর আবশ্যক এবং তা Luhn অ্যালগরিদম পাস করতে হবে।",
      "rule": "regex_and_luhn"
    },
    {
      "field": "price",
      "message": "পণ্যের মূল্য অবশ্যই ১০ টাকা থেকে ৫০ লক্ষ টাকার মধ্যে হতে হবে।",
      "rule": "min_max_integer"
    },
    {
      "field": "photos",
      "message": "কমপক্ষে ১টি এবং সর্বোচ্চ ৫টি ছবি আপলোড করতে হবে।",
      "rule": "array_length_1_to_5"
    }
  ],
  "trace_id": "req-f91b-8392-2026",
  "timestamp": "2026-10-21T18:15:30.000Z"
}
```

---

#### ১.৪.৩ অ্যাপ্লিকেশন এরর কোড রেজিস্ট্রি (Domain Error Taxonomy)

| ডোমেন মডিউল | অ্যাপ্লিকেশন এরর কোড (`code`) | HTTP স্ট্যাটাস | বাংলা বিবরণ ও সমাধান |
| :--- | :--- | :---: | :--- |
| **Auth & Security** | `AUTH_INVALID_CREDENTIALS` | `401` | মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়। |
| | `AUTH_TOKEN_EXPIRED` | `401` | অ্যাক্সেস টোকেনের মেয়াদ শেষ। রিফ্রেশ টোকেন কল করুন। |
| | `AUTH_TOKEN_REVOKED` | `401` | সেশন বাতিল করা হয়েছে বা পাসওয়ার্ড পরিবর্তিত হয়েছে। |
| | `AUTH_OTP_MISMATCH` | `400` | ভুল ওটিপি প্রদান করা হয়েছে। |
| | `AUTH_OTP_EXPIRED` | `410` | ওটিপির ২ মিনিটের মেয়াদ শেষ হয়েছে। পুনরায় ওটিপি নিন। |
| | `AUTH_ACCOUNT_FROZEN` | `403` | ডিসপিউটের কারণে আপনার অ্যাকাউন্ট সাময়িক স্থগিত রয়েছে। |
| | `AUTH_ACCOUNT_BANNED` | `403` | ৩টি ফ্রড স্ট্রাইকের কারণে আপনার অ্যাকাউন্ট স্থায়ীভাবে নিষিদ্ধ। |
| **NID KYC & Minor** | `KYC_DOC_BLURRY` | `400` | ছবি অস্পষ্ট বা লেখা পড়ার উপযোগী নয়। ফ্রেশ ছবি দিন। |
| | `KYC_AGE_UNDER_18` | `400` | বয়স ১৮ বছরের নিচে। অভিভাবকের সম্মতি ফ্লো ব্যবহার করুন। |
| | `KYC_DUPLICATE_NID` | `409` | এই NID কার্ড দিয়ে ইতোমধ্যেই প্ল্যাটফর্মে অ্যাকাউন্ট রয়েছে। |
| | `KYC_PARENT_LIMIT_EXCEEDED`| `403` | একজন অভিভাবক সর্বোচ্চ ২টি অপ্রাপ্তবয়স্ক অ্যাকাউন্ট অনুমোদন করতে পারেন। |
| **Listings & Anti-Theft** | `LISTING_IMEI_DUPLICATE_ACTIVE` | `409` | এই IMEI নম্বর দিয়ে ইতোমধ্যে একটি সক্রিয় বিজ্ঞাপন চলমান রয়েছে। |
| | `LISTING_IMEI_LUHN_INVALID`| `400` | ১৫ ডিজিটের IMEI নম্বরের চেকসাম সঠিক নয়। |
| | `LISTING_UNAUTHORIZED_EDIT`| `403` | আপনি অন্যের বিজ্ঞাপন সম্পাদনা বা মুছে ফেলতে পারবেন না (IDOR)। |
| | `LISTING_NOT_FOUND` | `404` | কাঙ্ক্ষিত বিজ্ঞাপনটি পাওয়া যায়নি অথবা মেয়াদোত্তীর্ণ। |
| **Privacy Shield** | `PRIVACY_NID_VERIFICATION_REQUIRED` | `403` | বিক্রেতার নম্বর দেখতে বা চ্যাট করতে NID ভেরিফিকেশন সম্পন্ন করুন। |
| | `PRIVACY_DAILY_LIMIT_EXCEEDED`| `429` | দৈনিক সর্বোচ্চ ১৫টি ফোন নম্বর উন্মোচনের কোটা শেষ হয়েছে। |
| | `CHAT_PHONE_NUMBER_FORBIDDEN` | `400` | চ্যাট মেসেজে ফোন নম্বর আদান-প্রদান নিষিদ্ধ। বাটন ব্যবহার করুন। |
| | `CHAT_ROOM_LOCKED` | `423` | পণ্য বিক্রি বা ডিলিট হওয়ায় এই চ্যাট রুমটি লক করা হয়েছে। |
| **Deals & Ratings** | `DEAL_ALREADY_SOLD` | `400` | বিজ্ঞাপনটি ইতোমধ্যে বিক্রি হিসেবে চিহ্নিত হয়েছে। |
| | `RATING_WINDOW_EXPIRED` | `410` | বিক্রয়ের ৭ দিন অতিক্রান্ত হওয়ায় রেটিং উইন্ডো বন্ধ হয়ে গেছে। |
| | `RATING_ALREADY_SUBMITTED` | `409` | আপনি ইতোমধ্যে এই লেনদেনে রেটিং প্রদান করেছেন। |
| **Disputes** | `DISPUTE_WINDOW_EXPIRED` | `400` | পণ্য ক্রয়ের ৭২ ঘণ্টা অতিক্রান্ত হওয়ায় ডিসপিউট খোলা সম্ভব নয়। |
| | `DISPUTE_ALREADY_EXISTS` | `409` | এই ক্রয়ের বিপরীতে ইতোমধ্যে একটি ডিসপিউট তদন্তাধীন রয়েছে। |
| **Payments** | `PAYMENT_IDEMPOTENCY_CONFLICT` | `409` | এই রিকোয়েস্টের পেমেন্ট প্রসেসিং চলছে। ডাবল চার্জিং রোধে ব্লকড। |
| | `PAYMENT_SIGNATURE_INVALID` | `401` | বিকাশ/নগদ গেটওয়ে আইপিএন সিগনেচার সঠিক নয়। |
| **System & Network** | `RATE_LIMIT_EXCEEDED` | `429` | খুব বেশি রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন। |
| | `INTERNAL_SERVER_ERROR` | `500` | সার্ভারে অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে। আমাদের ইঞ্জিনিয়ারিং টিম অবহিত। |
| | `SERVICE_UNAVAILABLE` | `503` | সিস্টেম মেইনটেন্যান্স চলছে। সাময়িকভাবে সেবা স্থগিত। |

---

#### ১.৪.৪ এরর রিট্রাই পলিসি ও ক্লায়েন্ট রেসপন্সিবিলিটি (Retry Guidelines)

| এইচটিটিপি স্ট্যাটাস | ত্রুটির ধরন | ক্লায়েন্ট রিট্রাই আচরণ (Client Behavior) |
| :---: | :---: | :--- |
| **`400`, `401`, `403`, `404`, `409`, `423`** | **Non-Retryable (স্থায়ী ক্লায়েন্ট ভুল)** | **কখনোই স্বয়ংক্রিয়ভাবে পুনরায় কল করবে না।** ব্যবহারকারীকে সরাসরি বাংলা `detail` বার্তা দেখিয়ে ইনপুট সংশোধন করতে বলতে হবে। |
| **`429 Too Many Requests`** | **Rate-Limited** | রেসপন্স হেডার `Retry-After: <seconds>` পড়ে সেই নির্দিষ্ট সেকেন্ড অপেক্ষা করার পর রিট্রাই করতে হবে। |
| **`500`, `502`, `503`, `504`** | **Transient / Retryable (সার্ভার লোড/নেটওয়ার্ক)** | **Exponential Backoff with Full Jitter** প্রয়োগ করতে হবে: `Wait = min(MaxWait, Base * 2^Attempt + RandomJitter)` (e.g. ১ম রিট্রাই ১s, ২য় রিট্রাই ২s, ৩য় রিট্রাই ৪s; সর্বোচ্চ ৩ বার)। |

---

#### ১.৪.৫ Express.js সেন্ট্রালাইজড এরর হ্যান্ডলার পাইপলাইন (Server Architecture)

সার্ভারের কোনো ত্রুটি যাতে ক্লায়েন্টে আনহ্যান্ডেলড স্ট্যাকট্রেস (Stack Trace) বা সংবেদনশীল ডেটাবেজ পাথ ফাঁস না করে, সেজন্য সেন্ট্রালাইজড মিডলওয়্যার লজিক:

```
[Request] ──► [Route Controller]
                     │
                     ▼ (try/catch or async wrapper)
              [Error Thrown]
                     │
                     ├── 1. ZodError? ────────────────► 400 Bad Request + errors[]
                     ├── 2. Mongoose Duplicate (11000)? ─► 409 Conflict + code
                     ├── 3. Custom AppError? ──────────► Assigned Status + localized message
                     └── 4. Uncaught Generic Error? ───► Log to Sentry + 500 RFC 7807 (Generic)
```

---

## Module 1: Authentication & Session Management

### ১.১ Send Registration OTP
* **মেথড:** `POST`
* **পাথ:** `/auth/register/send-otp`
* **অথেনটিকেশন:** `Public (L0)`
* **রেট লিমিট:** ৩ রিকোয়েস্ট / ১০ মিনিট (প্রতি আইপি/ফোন নম্বর)
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "phone_number": "+8801712345678",
    "recaptcha_token": "03AFcWeA7..."
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "message": "OTP সফলভাবে পাঠানো হয়েছে।",
      "expires_in_seconds": 120,
      "resend_available_in": 60
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (ভুল নম্বর), `409 Conflict` (নম্বর ইতোমধ্যে নিবন্ধিত), `429 Too Many Requests`।

---

### ১.২ Verify Registration OTP & Set Password
* **মেথড:** `POST`
* **পাথ:** `/auth/register/verify-otp`
* **অথেনটিকেশন:** `Public (L0)`
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "phone_number": "+8801712345678",
    "otp_code": "583921",
    "full_name": "তানভীর আহমেদ",
    "password": "SecurePassword@123"
  }
  ```
* **রেসপন্স `201 Created`:**
  * *Set-Cookie Header:* `refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "user": {
        "id": "671400000000000000000001",
        "phone_number": "+8801712345678",
        "full_name": "তানভীর আহমেদ",
        "role": "UNVERIFIED_USER",
        "nid_status": "UNVERIFIED"
      },
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_expires_in": 900
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (ভুল OTP বা দুর্বল পাসওয়ার্ড), `410 Gone` (OTP মেয়াদোত্তীর্ণ)।

---

### ১.৩ User Login
* **মেথড:** `POST`
* **পাথ:** `/auth/login`
* **অথেনটিকেশন:** `Public (L0)`
* **রেট লিমিট:** ৫ ব্যর্থ চেষ্টা / ১৫ মিনিট (ব্রুট-ফোর্স গার্ড)
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "phone_number": "+8801712345678",
    "password": "SecurePassword@123",
    "device_fingerprint": "dfp_9843a7bc21"
  }
  ```
* **রেসপন্স `200 OK`:**
  * *Set-Cookie Header:* `refresh_token=...; HttpOnly; Secure; SameSite=Strict`
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "user": {
        "id": "671400000000000000000001",
        "phone_number": "+8801712345678",
        "full_name": "তানভীর আহমেদ",
        "role": "VERIFIED_USER",
        "nid_status": "APPROVED",
        "rating_average": 4.8,
        "completed_deals_count": 7
      },
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_expires_in": 900
    }
  }
  ```
* **এরর কোডস:** `401 Unauthorized`, `403 Forbidden` (অ্যাকাউন্ট নিষিদ্ধ বা ফ্রিজ)।

---

### ১.৪ Refresh Access Token
* **মেথড:** `POST`
* **পাথ:** `/auth/refresh-token`
* **অথেনটিকেশন:** `Public (Cookie-Based)` — `refresh_token` কুকি রিড করে
* **রিকোয়েস্ট বডি:** খালি (`{}`)
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_expires_in": 900
    }
  }
  ```
* **এরর কোডস:** `401 Unauthorized` (রিফ্রেশ টোকেন মেয়াদোত্তীর্ণ বা ব্ল্যাকলিস্টেড)।

---

### ১.৫ Logout
* **মেথড:** `POST`
* **পাথ:** `/auth/logout`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রেসপন্স `200 OK`:**
  * *Clear-Cookie Header:* `refresh_token=; Max-Age=0`
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "message": "সফলভাবে লগআউট সম্পন্ন হয়েছে। সেশন নিষ্ক্রিয় করা হয়েছে।"
    }
  }
  ```

---

### ১.৬ Get Current User Profile (`/auth/me`)
* **মেথড:** `GET`
* **পাথ:** `/auth/me`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "id": "671400000000000000000001",
      "phone_number": "+8801712345678",
      "full_name": "তানভীর আহমেদ",
      "avatar_url": "https://cdn.becha-kena.com/avatars/user-1.webp",
      "role": "VERIFIED_USER",
      "nid_status": "APPROVED",
      "rating_average": 4.8,
      "rating_count": 12,
      "completed_deals_count": 7,
      "strikes_count": 0,
      "is_frozen": false
    }
  }
  ```

---

## Module 2: NID KYC Verification & Minor Parental Gate

### ২.১ Submit NID for Verification (Adult 18+)
* **মেথড:** `POST`
* **পাথ:** `/kyc/nid/submit`
* **অথেনটিকেশন:** `Authenticated (L1)` — রোল: `UNVERIFIED_USER`
* **রিকোয়েস্ট হেডার:** `Content-Type: multipart/form-data`
* **রিকোয়েস্ট বডি (Form-Data):**
  - `nid_number`: `"19922695847000123"` (১০, ১৩ বা ১৭ ডিজিট)
  - `date_of_birth`: `"1992-05-14"`
  - `front_image`: `Binary File (WebP/JPEG, Max 5MB)`
  - `back_image`: `Binary File (WebP/JPEG, Max 5MB)`
* **রেসপন্স `202 Accepted`:**
  ```json
  {
    "success": true,
    "status": 202,
    "data": {
      "nid_status": "PENDING_REVIEW",
      "message": "NID যাচাইকরণ কিউতে জমা হয়েছে। OCR স্বয়ংক্রিয় প্রসেসিং চলছে (আনুমানিক ১-২ মিনিট)।"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (অস্পষ্ট ছবি/১৮ বছরের কম বয়স), `409 Conflict` (এই NID দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে)।

---

### ২.২ Minor Parental Consent Verification (<18)
* **মেথড:** `POST`
* **পাথ:** `/kyc/minor/parental-consent`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "parent_phone_number": "+8801812345678",
    "parent_nid_number": "19752695847000888",
    "date_of_birth": "2009-08-10"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "message": "অভিভাবকের নম্বরে সম্মতি কোড (OTP) পাঠানো হয়েছে।",
      "parent_phone_masked": "+88018****5678"
    }
  }
  ```

---

### ২.৩ Verify Parental Consent OTP
* **মেথড:** `POST`
* **পাথ:** `/kyc/minor/parental-consent/verify`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "parent_phone_number": "+8801812345678",
    "otp_code": "847291"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "role": "PARENT_VERIFIED_MINOR",
      "nid_status": "APPROVED",
      "message": "অভিভাবকের সম্মতি সফলভাবে যাচাই হয়েছে। অপ্রাপ্তবয়স্ক অ্যাকাউন্ট সক্রিয় করা হয়েছে।"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request`, `403 Forbidden` (অভিভাবকের অধীনে ইতোমধ্যে ২টি অপ্রাপ্তবয়স্ক অ্যাকাউন্ট যুক্ত)।

---

## Module 3: Category & Taxonomy Management

### ৩.১ Get Category Tree
* **মেথড:** `GET`
* **পাথ:** `/categories`
* **অথেনটিকেশন:** `Public (L0)`
* **ক্যাশিং:** Cloudflare Edge ও Redis ক্যাশ (TTL: ১ ঘণ্টা)
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": [
      {
        "id": "671420000000000000000001",
        "name_bn": "ইলেকট্রনিক্স",
        "name_en": "Electronics",
        "slug": "electronics",
        "icon_url": "https://cdn.becha-kena.com/icons/electronics.svg",
        "sub_categories": [
          {
            "id": "671420000000000000000002",
            "name_bn": "স্মার্টফোন",
            "name_en": "Smartphones",
            "slug": "smartphones",
            "required_fields": ["imei_number"],
            "optional_fields": ["cash_memo_photo", "box_photo"]
          },
          {
            "id": "671420000000000000000003",
            "name_bn": "ল্যাপটপ ও কম্পিউটার",
            "name_en": "Laptops & Computers",
            "slug": "laptops-computers",
            "required_fields": ["serial_number"],
            "optional_fields": ["cash_memo_photo", "charger_photo"]
          }
        ]
      }
    ]
  }
  ```

---

## Module 4: Product Listings & Anti-Theft IMEI Gate

### ৪.১ Search & Browse Listings (Geo Proximity + Featured Boost)
* **মেথড:** `GET`
* **পাথ:** `/listings`
* **অথেনটিকেশন:** `Public (L0)`
* **কুয়েরি প্যারামিটার:**
  - `keyword` (Optional, String): সার্চ কীওয়ার্ড (e.g. "iPhone 13")
  - `category_slug` (Optional, String): ক্যাটাগরি স্লাগ
  - `lat` (Optional, Float): ব্যবহারকারীর অক্ষাংশ (e.g. `23.7465`)
  - `lng` (Optional, Float): দ্রাঘিমাংশ (e.g. `90.3742`)
  - `radius_km` (Optional, Integer, Default: 10): ব্যাসার্ধ (কি.মি.)
  - `min_price` / `max_price` (Optional, Integer)
  - `condition` (Optional, Enum): `LIKE_NEW,GENTLY_USED,FAIR,FOR_PARTS`
  - `page` (Optional, Integer, Default: 1)
  - `limit` (Optional, Integer, Default: 20)
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "listings": [
        {
          "id": "671410000000000000000001",
          "title": "iPhone 13 Pro 128GB - Graphite (Official BTRC)",
          "slug": "iphone-13-pro-128gb-graphite-btrc-9823",
          "price": 68000,
          "is_negotiable": true,
          "condition": "LIKE_NEW",
          "primary_photo": "https://cdn.becha-kena.com/listings/iphone13-front.webp",
          "location": {
            "division": "ঢাকা",
            "district": "ঢাকা",
            "thana": "ধানমন্ডি",
            "distance_km": 1.2
          },
          "is_featured": true,
          "is_urgent": false,
          "seller": {
            "id": "671400000000000000000001",
            "full_name": "তানভীর আহমেদ",
            "is_nid_verified": true,
            "rating_average": 4.8,
            "completed_deals_count": 7
          },
          "created_at": "2026-10-01T12:00:00.000Z"
        }
      ],
      "pagination": {
        "current_page": 1,
        "total_pages": 8,
        "total_items": 152,
        "has_next": true
      }
    }
  }
  ```

---

### ৪.২ Get Listing Details
* **মেথড:** `GET`
* **পাথ:** `/listings/:slug`
* **অথেনটিকেশন:** `Public (L0)`
* **সাইড-ইফেক্ট:** Redis হাইপারলগলগ দ্বারা ২০ সেকেন্ড কুলডাউনে ভিউ কাউন্টার বৃদ্ধি।
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "id": "671410000000000000000001",
      "title": "iPhone 13 Pro 128GB - Graphite (Official BTRC)",
      "slug": "iphone-13-pro-128gb-graphite-btrc-9823",
      "description": "ব্যাটারি হেলথ ৮৭%। সম্পূর্ণ ফ্রেশ কন্ডিশন। অরিজিনাল ক্যাশ মেমো ও বক্স রয়েছে।",
      "price": 68000,
      "is_negotiable": true,
      "condition": "LIKE_NEW",
      "photos": [
        { "url": "https://cdn.becha-kena.com/listings/iphone13-front.webp", "is_primary": true },
        { "url": "https://cdn.becha-kena.com/listings/iphone13-back.webp", "is_primary": false }
      ],
      "cash_memo_url": "https://cdn.becha-kena.com/listings/memo-9823.webp",
      "box_photo_url": "https://cdn.becha-kena.com/listings/box-9823.webp",
      "location": {
        "division": "ঢাকা",
        "district": "ঢাকা",
        "thana": "ধানমন্ডি",
        "coordinates": [90.3742, 23.7465]
      },
      "status": "ACTIVE",
      "is_featured": true,
      "is_urgent": false,
      "views_count": 343,
      "expires_at": "2026-11-15T12:00:00.000Z",
      "seller": {
        "id": "671400000000000000000001",
        "full_name": "তানভীর আহমেদ",
        "avatar_url": "https://cdn.becha-kena.com/avatars/user-1.webp",
        "is_nid_verified": true,
        "rating_average": 4.8,
        "rating_count": 12,
        "completed_deals_count": 7
      }
    }
  }
  ```
* **এরর কোডস:** `404 Not Found`।

---

### ৪.৩ Create New Listing (Anti-Theft IMEI Gate)
* **মেথড:** `POST`
* **পাথ:** `/listings`
* **অথেনটিকেশন:** `NID_Verified (L2)` — বিক্রেতাকে অবশ্যই ভেরিফাইড হতে হবে।
* **ভ্যালিডেশন রুলস:**
  - স্মার্টফোন ক্যাটাগরিতে ১৫-ডিজিটের Luhn-ভ্যালিডেটেড `imei_number` বাধ্যতামূলক।
  - সক্রিয় কোনো বিজ্ঞাপনে একই IMEI থাকলে স্বয়ংক্রিয়ভাবে প্রত্যাখ্যাত হবে।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "category_id": "671420000000000000000002",
    "title": "iPhone 13 Pro 128GB - Graphite (Official BTRC)",
    "description": "ব্যাটারি হেলথ ৮৭%। সম্পূর্ণ ফ্রেশ কন্ডিশন। অরিজিনাল ক্যাশ মেমো ও বক্স রয়েছে।",
    "price": 68000,
    "is_negotiable": true,
    "condition": "LIKE_NEW",
    "imei_number": "358948123456789",
    "photos": [
      { "url": "https://cdn.becha-kena.com/listings/iphone13-front.webp", "is_primary": true },
      { "url": "https://cdn.becha-kena.com/listings/iphone13-back.webp", "is_primary": false }
    ],
    "cash_memo_url": "https://cdn.becha-kena.com/listings/memo-9823.webp",
    "box_photo_url": "https://cdn.becha-kena.com/listings/box-9823.webp",
    "location": {
      "type": "Point",
      "coordinates": [90.3742, 23.7465]
    },
    "division": "ঢাকা",
    "district": "ঢাকা",
    "thana": "ধানমন্ডি"
  }
  ```
* **রেসপন্স `201 Created`:**
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "id": "671410000000000000000001",
      "slug": "iphone-13-pro-128gb-graphite-btrc-9823",
      "status": "PENDING_REVIEW",
      "message": "বিজ্ঞাপন সফলভাবে তৈরি হয়েছে। স্বয়ংক্রিয় মডারেশন কিউতে অনুমোদনের অপেক্ষায় রয়েছে।"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (ভুল IMEI / Luhn অ্যালগরিদম ব্যর্থ), `403 Forbidden` (NID আনভেরিফাইড), `409 Conflict` (এই IMEI নম্বর দিয়ে অন্য সক্রিয় বিজ্ঞাপন বিদ্যমান)।

---

### ৪.৪ Update Listing
* **মেথড:** `PUT`
* **পাথ:** `/listings/:id`
* **অথেনটিকেশন:** `NID_Verified (L2)` — শুধুমাত্র বিজ্ঞাপনের মালিক (IDOR Guard)
* **সীমাবদ্ধতা:** একবার বিজ্ঞাপন প্রকাশিত হলে নিরাপত্তা স্বার্থে `imei_number` পরিবর্তন নিষিদ্ধ।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "title": "iPhone 13 Pro 128GB - Graphite (Price Reduced)",
    "price": 65000,
    "is_negotiable": false,
    "description": "জরুরি টাকার প্রয়োজনে মূল্য কমানো হলো। সম্পূর্ণ ফ্রেশ কন্ডিশন।"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "id": "671410000000000000000001",
      "price": 65000,
      "message": "বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে।"
    }
  }
  ```
* **এরর কোডস:** `403 Forbidden` (অন্যের বিজ্ঞাপন আপডেটের চেষ্টা), `404 Not Found`।

---

## Module 5: Contact Privacy Shield & Phone Reveal

### ৫.১ Reveal Seller Phone Number (Rate-Limited Contact Unmask)
* **মেথড:** `POST`
* **পাথ:** `/listings/:id/contact`
* **অথেনটিকেশন:** `NID_Verified (L2)` — **উভয় পক্ষকেই (Buyer & Seller) NID Approved হতে হবে।**
* **রেট লিমিট:** দৈনিক সর্বোচ্চ ১৫টি ফোন নম্বর উন্মোচন (Redis Counter Guard)।
* **নিরাপত্তা:** স্ক্র্যাপার বটের হাত থেকে আসল নম্বর বাঁচাতে HMAC-SHA256 সাইনড ওয়ান-টাইম অ্যাকশন।
* **রিকোয়েস্ট বডি:** খালি (`{}`)
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "seller_name": "তানভীর আহমেদ",
      "phone_number": "+8801712345678",
      "remaining_daily_reveals": 14,
      "disclaimer": "নিরাপদ স্থানে লেনদেন করুন। অগ্রিম টাকা পাঠানো থেকে বিরত থাকুন।"
    }
  }
  ```
* **এরর কোডস:**
  - `403 Forbidden`: বায়ারের NID যাচাইকৃত না হলে (`NID_VERIFICATION_REQUIRED`)
  - `429 Too Many Requests`: দৈনিক ১৫টি নম্বর রিভিলের কোটা শেষ হলে (`DAILY_CONTACT_LIMIT_EXCEEDED`)
  - `404 Not Found`: বিজ্ঞাপন খুঁজে না পেলে

---

## Module 6: In-App Messaging & Safe Meetup Zones

### ৬.১ Initiate / Open Chat Room
* **মেথড:** `POST`
* **পাথ:** `/chats/rooms`
* **অথেনটিকেশন:** `NID_Verified (L2)` — উভয় পক্ষ NID Approved আবশ্যক
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "listing_id": "671410000000000000000001"
  }
  ```
* **রেসপন্স `200 OK` (বা `201 Created` যদি নতুন রুম হয়):**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "room_id": "671490000000000000000001",
      "listing": {
        "id": "671410000000000000000001",
        "title": "iPhone 13 Pro 128GB",
        "price": 68000,
        "thumbnail": "https://cdn.becha-kena.com/listings/iphone13-front.webp"
      },
      "peer_user": {
        "id": "671400000000000000000001",
        "full_name": "তানভীর আহমেদ",
        "rating_average": 4.8
      },
      "status": "ACTIVE"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (নিজের পণ্যে নিজে চ্যাট শুরু করা নিষিদ্ধ), `403 Forbidden` (NID আনভেরিফাইড)।

---

### ৬.২ Get Room Messages (Paginated)
* **মেথড:** `GET`
* **পাথ:** `/chats/rooms/:roomId/messages`
* **অথেনটিকেশন:** `NID_Verified (L2)` — শুধুমাত্র রুমের ২ জন অংশগ্রহণকারী
* **কুয়েরি প্যারামিটার:** `cursor` (Date string), `limit` (Default: 30)
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "messages": [
        {
          "id": "671488000000000000000001",
          "sender_id": "671400000000000000000002",
          "content": "ভাই ফোনটি কি এখনো অ্যাভেইলেবল আছে?",
          "content_type": "TEXT",
          "created_at": "2026-10-02T10:15:00.000Z"
        }
      ],
      "has_more": false
    }
  }
  ```

---

### ৬.৩ Send Message (Anti-Bypass Regex Guard)
* **মেথড:** `POST`
* **পাথ:** `/chats/rooms/:roomId/messages`
* **অথেনটিকেশন:** `NID_Verified (L2)`
* **নিরাপত্তা লজিক:** চ্যাট টেক্সটে সরাসরি মোবাইল নম্বর, বাংলা বা ইংরেজিতে ছদ্মবেশী সংখ্যা (e.g. "০১৭১...", "zero one seven...") শনাক্ত হলে বার্তা ব্লক করা হবে এবং ওয়ার্নিং দেওয়া হবে।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "content": "জি ভাই অ্যাভেইলেবল। আপনি ধানমন্ডি এসে দেখে নিতে পারেন।"
  }
  ```
* **রেসপন্স `201 Created`:**
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "id": "671488000000000000000002",
      "sender_id": "671400000000000000000001",
      "content": "জি ভাই অ্যাভেইলেবল। আপনি ধানমন্ডি এসে দেখে নিতে পারেন।",
      "content_type": "TEXT",
      "created_at": "2026-10-02T10:16:30.000Z"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (কন্টাক্ট বাইপাস শনাক্ত: `PHONE_NUMBER_IN_CHAT_FORBIDDEN`), `423 Locked` (রুম লক করা থাকলে)।

---

### ৬.৪ Get Safe Public Meetup Zones
* **মেথড:** `GET`
* **পাথ:** `/chats/rooms/:roomId/safe-zones`
* **অথেনটিকেশন:** `NID_Verified (L2)`
* **ইন্টিগ্রেশন:** Google Places API থেকে নিকটস্থ থানা, মেট্রো স্টেশন বা শপিংমল ফিল্টার।
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "recommended_zones": [
        {
          "name": "ধানমন্ডি মডেল থানা চত্বর",
          "type": "POLICE_STATION",
          "lat": 23.7428,
          "lng": 90.3789,
          "distance_meters": 650
        },
        {
          "name": "এমআরটি লাইন-৬ ধানমন্ডি স্টেশন কনকোর্স",
          "type": "METRO_STATION",
          "lat": 23.7455,
          "lng": 90.3802,
          "distance_meters": 850
        }
      ]
    }
  }
  ```

---

## Module 7: Deal Finalization & Mutual Ratings

### ৭.১ Mark Listing as Sold (Complete Deal Transaction)
* **মেথড:** `POST`
* **পাথ:** `/listings/:id/mark-sold`
* **অথেনটিকেশন:** `NID_Verified (L2)` — শুধুমাত্র বিজ্ঞাপনের বিক্রেতা (Owner)
* **অ্যাটমিক কার্যপ্রণালী:**
  - লিস্টিং স্ট্যাটাস `SOLD`-এ রূপান্তর
  - সকল চ্যাট রুম `LOCKED` করা
  - বায়ার ও সেলারের জন্য ৭-দিনের মেয়াদে ২টি রেটিং রেকর্ড ইনিশিয়ালাইজ
  - বিক্রেতার `completed_deals_count` ১ বৃদ্ধি
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "buyer_id": "671400000000000000000002"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "listing_id": "671410000000000000000001",
      "status": "SOLD",
      "rating_window_expires_at": "2026-10-09T18:00:00.000Z",
      "message": "পণ্যটি সফলভাবে বিক্রি হিসেবে চিহ্নিত হয়েছে। উভয় পক্ষ আগামী ৭ দিনের মধ্যে রিভিউ জমা দিতে পারবেন।"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (অনুপযুক্ত ক্রেতা বা ইতোমধ্যে বিক্রিত), `403 Forbidden` (বিক্রেতা ভিন্ন অন্য কেউ)।

---

### ৭.২ Submit Rating & Review
* **মেথড:** `POST`
* **পাথ:** `/ratings`
* **অথেনটিকেশন:** `Deal_Participant (L3)` — যে ডিল সম্পন্ন হয়েছে তার ক্রেতা বা বিক্রেতা
* **ভ্যালিডেশন:** বিক্রয়ের ৭ দিনের মধ্যে হতে হবে (`window_expires_at` চেক)।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "listing_id": "671410000000000000000001",
    "score": 5,
    "comment": "বিক্রেতা অত্যন্ত সৎ ও আন্তরিক ছিলেন। ডিভাইসের অবস্থা শতভাগ বর্ণনার সাথে মিলেছে।",
    "tags": ["Honest", "Accurate Description", "Punctual"]
  }
  ```
* **রেসপন্স `201 Created`:**
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "rating_id": "671430000000000000000001",
      "score": 5,
      "message": "আপনার রিভিউ ও রেটিং সফলভাবে গৃহীত হয়েছে।"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (১-৫ সীমার বাইরে স্কোর), `409 Conflict` (ইতোমধ্যে রেটিং দেওয়া হয়েছে), `410 Gone` (৭ দিনের রেটিং উইন্ডো শেষ)।

---

## Module 8: Post-Purchase Disputes & Fraud Investigation

### ৮.১ File Post-Purchase Fraud Dispute
* **মেথড:** `POST`
* **পাথ:** `/disputes`
* **অথেনটিকেশন:** `Deal_Participant (L3)` — বিক্রিত পণ্যের নিবন্ধিত ক্রেতা
* **কনস্ট্রেইন্ট:** বিক্রয় সম্পন্ন হওয়ার সর্বোচ্চ ৭২ ঘণ্টার মধ্যে অভিযোগ দাখিল করতে হবে।
* **সাইড-ইফেক্ট:** অভিযুক্ত বিক্রেতার অ্যাকাউন্ট তাৎক্ষণিক সাময়িক ফ্রিজ (`is_frozen = true`) হবে এবং অ্যাডমিন কিউতে জরুরি টিকেট তৈরি হবে।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "listing_id": "671410000000000000000001",
    "reason": "CLONE_DEVICE",
    "description": "বিক্রেতা ডিভাইসটি আসল অ্যাপল বলে দাবি করেছিলেন, কিন্তু দোকানে পরীক্ষা করে নিশ্চিত হওয়া গেছে এটি ক্লোন অ্যান্ড্রয়েড মাদারবোর্ড।",
    "evidence_urls": [
      "https://cdn.becha-kena.com/disputes/evidence-motherboard-check.webp",
      "https://cdn.becha-kena.com/disputes/evidence-shop-receipt.webp"
    ]
  }
  ```
* **রেসপন্স `201 Created`:**
  ```json
  {
    "success": true,
    "status": 201,
    "data": {
      "dispute_id": "671440000000000000000001",
      "status": "OPEN",
      "message": "অভিযোগটি সফলভাবে নথিভুক্ত হয়েছে। অভিযুক্তের অ্যাকাউন্ট সাময়িক স্থগিত করা হয়েছে এবং একজন অ্যাডমিন কর্মকর্তা তদন্ত শুরু করবেন।"
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request` (৭২ ঘণ্টার উইন্ডো পার হওয়া: `DISPUTE_WINDOW_EXPIRED`), `403 Forbidden`, `409 Conflict` (ইতোমধ্যে তদন্তাধীন)।

---

### ৮.২ Get User Disputes List
* **মেথড:** `GET`
* **পাথ:** `/disputes/my-disputes`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": [
      {
        "id": "671440000000000000000001",
        "listing_title": "iPhone 13 Pro 128GB",
        "role": "PLAINTIFF",
        "reason": "CLONE_DEVICE",
        "status": "UNDER_INVESTIGATION",
        "created_at": "2026-10-05T09:15:00.000Z"
      }
    ]
  }
  ```

---

## Module 9: Payments, Monetization & IPN Webhooks

### ৯.১ Initiate Monetization Payment
* **মেথড:** `POST`
* **পাথ:** `/payments/initiate`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "type": "FEATURED_AD_7D",
    "listing_id": "671410000000000000000001",
    "gateway": "BKASH",
    "idempotency_key": "idem-77291a-8839-20261021"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "payment_id": "671450000000000000000001",
      "amount": 199,
      "currency": "BDT",
      "gateway_redirect_url": "https://checkout.pay.bka.sh/v1.2.0-beta/checkout?paymentID=TR001192...",
      "expires_in_seconds": 600
    }
  }
  ```
* **এরর কোডস:** `400 Bad Request`, `409 Conflict` (আইডেমপোটেন্সি কি ডুপ্লিকেট)।

---

### ৯.২ bKash IPN Webhook Callback
* **মেথড:** `POST`
* **পাথ:** `/payments/webhook/bkash`
* **অথেনটিকেশন:** `Public (HMAC-SHA256 Signature Verified)`
* **রিকোয়েস্ট হেডার:** `X-bKash-Signature: <base64-hmac-signature>`
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "paymentID": "TR001192847192",
    "trxID": "BKA8819283719",
    "transactionStatus": "Completed",
    "amount": "199.00",
    "currency": "BDT",
    "idempotency_key": "idem-77291a-8839-20261021"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Webhook processed successfully"
  }
  ```
* **এরর কোডস:** `401 Unauthorized` (অবৈধ সিগনেচার), `400 Bad Request`।

---

## Module 10: In-App Notifications

### ১০.১ Get User Notifications
* **মেথড:** `GET`
* **পাথ:** `/notifications`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **কুয়েরি প্যারামিটার:** `page` (Default: 1), `limit` (Default: 20)
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "notifications": [
        {
          "id": "671460000000000000000001",
          "title": "বিজ্ঞাপন স্পন্সরড হয়েছে!",
          "message": "আপনার 'iPhone 13 Pro' বিজ্ঞাপনটি আগামী ৭ দিনের জন্য Featured হিসেবে শীর্ষে পিন করা হয়েছে।",
          "event_type": "PAYMENT_SUCCESS",
          "action_url": "/listings/iphone-13-pro-128gb-graphite-btrc-9823",
          "is_read": false,
          "created_at": "2026-10-01T13:00:00.000Z"
        }
      ],
      "unread_count": 1
    }
  }
  ```

---

### ১০.২ Get Fast Unread Notification Count (Polling Endpoint)
* **মেথড:** `GET`
* **পাথ:** `/notifications/unread-count`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "unread_count": 1
    }
  }
  ```

---

### ১০.৩ Mark Notification as Read
* **মেথড:** `PATCH`
* **পাথ:** `/notifications/:id/read`
* **অথেনটিকেশন:** `Authenticated (L1)`
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "id": "671460000000000000000001",
      "is_read": true
    }
  }
  ```

---

## Module 11: Admin Governance & Law Enforcement Compliance

### ১১.১ Get Pending NID Verification Queue (FIFO Priority)
* **মেথড:** `GET`
* **পাথ:** `/admin/kyc/queue`
* **অথেনটিকেশন:** `Admin_Moderator (L4)`
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": [
      {
        "verification_id": "671480000000000000000001",
        "user_id": "671400000000000000000001",
        "full_name": "তানভীর আহমেদ",
        "phone_number": "+8801712345678",
        "nid_number_masked": "****-****-0123",
        "front_image_presigned_url": "https://s3.private.becha-kena.com/nid/front-enc?token=...",
        "back_image_presigned_url": "https://s3.private.becha-kena.com/nid/back-enc?token=...",
        "ocr_confidence": 0.94,
        "submitted_at": "2026-10-01T12:00:00.000Z"
      }
    ]
  }
  ```

---

### ১১.২ Admin NID Verification Decision
* **মেথড:** `POST`
* **পাথ:** `/admin/kyc/:id/decision`
* **অথেনটিকেশন:** `Admin_Moderator (L4)`
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "decision": "APPROVED",
    "rejection_reason": null,
    "admin_notes": "ডকুমেন্টের সাথে জন্মতারিখ ও নাম হুবহু মিলেছে।"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "verification_id": "671480000000000000000001",
      "user_status": "APPROVED",
      "message": "ব্যবহারকারীর NID সফলভাবে অনুমোদিত হয়েছে।"
    }
  }
  ```

---

### ১১.৩ Admin Dispute Resolution Verdict
* **মেথড:** `POST`
* **পাথ:** `/admin/disputes/:id/resolve`
* **অথেনটিকেশন:** `Admin_Moderator (L4)`
* **অ্যাটমিক কার্যপ্রণালী:**
  - রায় `RESOLVED_BUYER_WIN` হলে: বিবাদী সেলারকে স্ট্রাইক (`strikes_count += 1`), ৩ স্ট্রাইক হলে আজীবন ব্যান (`is_banned = true`) এবং অ্যাকাউন্ট আনফ্রিজ।
  - রায় `DISMISSED` হলে: মিথ্যা অভিযোগকারী বায়ারকে সতর্কবার্তা (`warnings_count += 1`) এবং সেলার আনফ্রিজ।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "verdict": "RESOLVED_BUYER_WIN",
    "resolution_notes": "ক্রেতা টেকনিশিয়ান স্লিপ ও মাদারবোর্ড ক্লোনিং প্রমাণপত্র দিয়েছেন। বিক্রেতার বিবরণ অসত্য প্রমাণিত।"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "dispute_id": "671440000000000000000001",
      "verdict": "RESOLVED_BUYER_WIN",
      "strike_applied_to_seller": true,
      "seller_total_strikes": 1,
      "seller_banned": false,
      "message": "ডিসপিউট সফলভাবে নিষ্পত্তি হয়েছে।"
    }
  }
  ```

---

### ১১.৪ Law Enforcement Subpoena Compliance Export
* **মেথড:** `POST`
* **পাথ:** `/admin/compliance/subpoena-export`
* **অথেনটিকেশন:** `Super_Admin (L5)` — শুধুমাত্র অনুমোদিত উচ্চপদস্থ সুপার অ্যাডমিন
* **নিরাপত্তা:** আইন প্রয়োগকারী সংস্থার অফিসিয়াল জিডি/মামলার নম্বর যাচাই এবং পাসওয়ার্ড-সুরক্ষিত AES-256 জিপ আর্কাইভ তৈরি।
* **রিকোয়েস্ট বডি:**
  ```json
  {
    "case_reference_number": "GD-DMP-DHANMONDI-2026-9921",
    "requesting_authority": "Bangladesh Police - Cyber Crime Investigation Division",
    "target_user_id": "671400000000000000000004",
    "date_range_start": "2026-09-01T00:00:00.000Z",
    "date_range_end": "2026-10-21T23:59:59.000Z",
    "export_password": "ForensicSecretPassword@2026"
  }
  ```
* **রেসপন্স `200 OK`:**
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "download_url": "https://s3.private.becha-kena.com/compliance-exports/export-GD-9921.zip?token=...",
      "archive_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "records_included": {
        "user_profile": true,
        "nid_kyc_data": true,
        "listings_history": 3,
        "chat_logs": 28,
        "audit_logs": 14,
        "ip_session_history": 6
      },
      "expires_in_seconds": 3600
    }
  }
  ```

---

## ১২. এপিআই এন্ডপয়েন্ট ও অথেনটিকেশন সারসংক্ষেপ (API Quick Reference Table)

| মেথড | এন্ডপয়েন্ট পাথ | ডোমেন মডিউল | প্রয়োজনীয় অথেনটিকেশন (Auth) | রেট লিমিট |
| :---: | :--- | :--- | :--- | :---: |
| `POST` | `/auth/register/send-otp` | Auth | `Public (L0)` | ৩ / ১০ মিনিট |
| `POST` | `/auth/register/verify-otp` | Auth | `Public (L0)` | ৫ / ১৫ মিনিট |
| `POST` | `/auth/login` | Auth | `Public (L0)` | ৫ / ১৫ মিনিট |
| `POST` | `/auth/refresh-token` | Auth | `Public (Cookie)` | ২০ / মিনিট |
| `POST` | `/auth/logout` | Auth | `Authenticated (L1)` | ৬০ / মিনিট |
| `GET` | `/auth/me` | Auth | `Authenticated (L1)` | ৬০ / মিনিট |
| `POST` | `/kyc/nid/submit` | KYC | `Authenticated (L1)` | ৩ / দিন |
| `POST` | `/kyc/minor/parental-consent` | KYC | `Authenticated (L1)` | ৩ / দিন |
| `POST` | `/kyc/minor/parental-consent/verify` | KYC | `Authenticated (L1)` | ৫ / ১০ মিনিট |
| `GET` | `/categories` | Taxonomy | `Public (L0)` | Edge Cached |
| `GET` | `/listings` | Listings | `Public (L0)` | ৬০ / মিনিট |
| `GET` | `/listings/:slug` | Listings | `Public (L0)` | ৬০ / মিনিট |
| `POST` | `/listings` | Listings | `NID_Verified (L2)` | ১০ / দিন |
| `PUT` | `/listings/:id` | Listings | `NID_Verified (L2)` (Owner) | ২০ / ঘণ্টা |
| `POST` | `/listings/:id/contact` | Privacy Guard | `NID_Verified (L2)` (Dual-NID) | **১৫ / দিন** |
| `POST` | `/chats/rooms` | Chat | `NID_Verified (L2)` (Dual-NID) | ৩০ / ঘণ্টা |
| `GET` | `/chats/rooms/:roomId/messages` | Chat | `NID_Verified (L2)` (Member) | ৬০ / মিনিট |
| `POST` | `/chats/rooms/:roomId/messages` | Chat | `NID_Verified (L2)` (Member) | ৬০ / মিনিট |
| `GET` | `/chats/rooms/:roomId/safe-zones` | Chat | `NID_Verified (L2)` (Member) | ২০ / ঘণ্টা |
| `POST` | `/listings/:id/mark-sold` | Deals | `NID_Verified (L2)` (Seller) | ২০ / দিন |
| `POST` | `/ratings` | Ratings | `Deal_Participant (L3)` | ২০ / দিন |
| `POST` | `/disputes` | Disputes | `Deal_Participant (L3)` (Buyer) | ৫ / দিন |
| `GET` | `/disputes/my-disputes` | Disputes | `Authenticated (L1)` | ৩০ / মিনিট |
| `POST` | `/payments/initiate` | Monetization | `Authenticated (L1)` | ১০ / ঘণ্টা |
| `POST` | `/payments/webhook/bkash` | Webhook | `Public (HMAC Verified)` | আনলিমিটেড |
| `GET` | `/notifications` | Notifications | `Authenticated (L1)` | ৬০ / মিনিট |
| `GET` | `/notifications/unread-count` | Notifications | `Authenticated (L1)` | ১২০ / মিনিট |
| `PATCH` | `/notifications/:id/read` | Notifications | `Authenticated (L1)` | ৬০ / মিনিট |
| `GET` | `/admin/kyc/queue` | Admin KYC | `Admin_Moderator (L4)` | ৬০ / মিনিট |
| `POST` | `/admin/kyc/:id/decision` | Admin KYC | `Admin_Moderator (L4)` | ৬০ / মিনিট |
| `POST` | `/admin/disputes/:id/resolve` | Admin Disputes | `Admin_Moderator (L4)` | ৬০ / মিনিট |
| `POST` | `/admin/compliance/subpoena-export` | Admin Legal | `Super_Admin (L5)` | ৫ / দিন |

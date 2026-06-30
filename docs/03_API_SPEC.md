# MyKiv AI
## API Specification

Version: 1.0.0

Architecture

REST API

JSON

HTTPS

Next.js Route Handler

Supabase PostgreSQL

---

# API Principles

- RESTful
- Stateless
- JSON Only
- Versioning (/api/v1)
- Authentication Required
- AI Ready
- Consistent Response Schema

---

# Base URL

/api/v1

---

# Authentication

Provider

Supabase Auth

Authorization

Bearer Token

---

# Response Format

Success

{
  "success": true,
  "message": "",
  "data": {}
}

---

Error

{
  "success": false,
  "message": "",
  "errors": []
}

---

# Modules

1 Authentication

2 Dashboard

3 Health

4 Reminder

5 Couple

6 AI

7 Report

8 Finance

9 Presence

10 Media

---

# Authentication

POST

/auth/login

POST

/auth/logout

GET

/auth/me

PATCH

/auth/profile

---

# Dashboard

GET

/dashboard

Return

Today's Summary

Partner Summary

AI Recommendation

Upcoming Reminder

Health Score

Relationship Score

Recent Activity

---

# Health

Health menjadi parent module.

Submodule dipisahkan agar scalable.

---

Meal

GET

/meal

POST

/meal

GET

/meal/:id

PATCH

/meal/:id

DELETE

/meal/:id

---

Water

GET

/water

POST

/water

PATCH

/water/:id

DELETE

/water/:id

---

Sleep

GET

/sleep

POST

/sleep

PATCH

/sleep/:id

DELETE

/sleep/:id

---

Exercise

GET

/exercise

POST

/exercise

PATCH

/exercise/:id

DELETE

/exercise/:id

---

Mood

GET

/mood

POST

/mood

PATCH

/mood/:id

DELETE

/mood/:id

---

Medicine

GET

/medicine

POST

/medicine

PATCH

/medicine/:id

DELETE

/medicine/:id

---

# Reminder

GET

/reminder

POST

/reminder

PATCH

/reminder/:id

DELETE

/reminder/:id

POST

/reminder/:id/complete

POST

/reminder/:id/snooze

---

# Couple Activity

GET

/activity

POST

/activity

PATCH

/activity/:id

DELETE

/activity/:id

---

Wishlist

GET

/wishlist

POST

/wishlist

PATCH

/wishlist/:id

DELETE

/wishlist/:id

---

Anniversary

GET

/anniversary

POST

/anniversary

PATCH

/anniversary/:id

DELETE

/anniversary/:id

---

Photo Memory

GET

/photo

POST

/photo

DELETE

/photo/:id

---

# AI Memory

GET

/memory

POST

/memory

PATCH

/memory/:id

DELETE

/memory/:id

POST

/memory/search

---

# AI Assistant

POST

/ai/chat

POST

/ai/recommendation

POST

/ai/prediction

POST

/ai/coach

POST

/ai/summary

POST

/ai/report

POST

/ai/analyze

---

# Analytics

GET

/report/daily

GET

/report/weekly

GET

/report/monthly

---

# Expense

GET

/expense

POST

/expense

PATCH

/expense/:id

DELETE

/expense/:id

---

# Presence

GET

/location

POST

/location

PATCH

/location/live

GET

/location/history

DELETE

/location/history

---

# Media

POST

/upload

DELETE

/upload/:id

---

# Query Parameters

?page

?limit

?search

?sort

?order

?from

?to

---

# Status Code

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Validation

Semua endpoint wajib melakukan

Authentication

Authorization

Request Validation

Response Validation

Rate Limiting

---

# Security

HTTPS

JWT

Supabase Auth

Row Level Security

CSRF Protection

Input Validation

Rate Limiter

---

# Versioning

Seluruh endpoint menggunakan

/api/v1

Perubahan breaking change akan menggunakan

/api/v2

---

# Future APIs

/calendar

/device

/wearable

/voice

/notification

/widget

/webhook
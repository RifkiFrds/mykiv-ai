# MyKiv AI

# System Design

Version 1.0.0

Architecture

Modern Monolith

AI First

PWA

---

# 1. Architecture Overview

MyKiv AI menggunakan Modern Monolith Architecture.

Seluruh sistem dibangun menggunakan Next.js Full Stack dengan App Router.

Tidak terdapat backend service terpisah.

Semua business logic berada pada Service Layer.

Database menggunakan Supabase PostgreSQL.

AI dipisahkan menjadi AI Brain.

---

# 2. System Architecture

                    PWA

                     │

             React Components

                     │

              Server Actions

                     │

             Application Service

                     │

────────────────────────────────────

         Domain Layer

Health

Reminder

Couple

Expense

Memory

Report

AI

────────────────────────────────────

                     │

             Repository Layer

                     │

────────────────────────────────────

 Supabase

 PostgreSQL

 Storage

 Realtime

 Auth

────────────────────────────────────

                     │

                 AI Brain

                     │

             Context Engine

             Prompt Builder

             Memory Engine

             Response Parser

                     │

             Gemini Flash 2.5

---

# 3. Folder Structure

src/

app/

features/

shared/

services/

repositories/

lib/

hooks/

types/

constants/

styles/

ai/

contexts/

workers/

---

# 4. Feature Architecture

features/

dashboard/

health/

meal/

water/

sleep/

exercise/

medicine/

mood/

reminder/

activity/

wishlist/

expense/

location/

photo/

memory/

report/

ai/

settings/

notification/

Setiap feature bersifat independen.

Setiap feature memiliki

components/

actions/

services/

schemas/

types/

hooks/

---

# 5. Shared Layer

shared/

components/

ui/

layout/

icons/

utils/

validators/

config/

constants/

---

# 6. AI Brain

AI Brain merupakan pusat seluruh AI.

Terdiri dari

Context Engine

Memory Engine

Prompt Builder

Recommendation Engine

Prediction Engine

Response Validator

Conversation Manager

AI Brain menjadi satu-satunya pintu masuk menuju Gemini.

Frontend tidak boleh mengakses Gemini secara langsung.

---

# 7. Data Flow

User

↓

UI

↓

Server Action

↓

Service

↓

Repository

↓

Supabase

↓

Response

↓

UI Update

Jika membutuhkan AI

↓

AI Brain

↓

Gemini

↓

Response

↓

Database

↓

Dashboard

---

# 8. Offline Architecture

Semua data input pertama kali disimpan secara lokal.

Saat koneksi tersedia

↓

Background Sync

↓

Supabase

↓

Realtime Update

↓

Dashboard

Offline Data

Meal

Water

Sleep

Mood

Reminder Completion

Expense

Activity

---

# 9. Realtime Architecture

Supabase Realtime digunakan pada

Dashboard

Reminder

Health Tracker

Location

Activity

Notification

Realtime tidak digunakan pada AI Chat.

---

# 10. Notification Flow

Reminder

↓

Service Worker

↓

Push Notification

↓

Open App

↓

Deep Link

↓

Feature

AI Recommendation

↓

Notification

↓

Dashboard

---

# 11. Authentication

Supabase Auth

Google Login

Magic Link

Session Management

Protected Route

Role

Owner

Partner

---

# 12. Authorization

Seluruh data menggunakan Row Level Security.

Owner

Read Write

Partner

Read sesuai izin

Tidak terdapat public endpoint.

---

# 13. Security

HTTPS

Supabase Auth

JWT

RLS

Server Actions

Input Validation

Rate Limiter

Environment Variable

Encrypted Secret

---

# 14. State Management

React Server Component

Server Action

React Query

Context API

Local State

State dibagi menjadi

Server State

Client State

Offline State

AI State

---

# 15. Error Handling

Network Error

Offline Error

Validation Error

AI Error

Database Error

Storage Error

Semua error menggunakan format yang konsisten.

---

# 16. Logging

Application Log

AI Log

Performance Log

Error Log

Notification Log

Audit Log

---

# 17. Deployment

Frontend

Vercel

Database

Supabase

Storage

Supabase Storage

AI

Replicate

Environment

Production

Preview

Development

---

# 18. Scalability

Future Ready

Native Mobile

Wearable

Voice AI

Calendar

Payment

Health Device

Widget

---

# 19. Development Principles

Feature First

AI First

Server First

Type Safe

Reusable

Modular

Simple

Maintainable
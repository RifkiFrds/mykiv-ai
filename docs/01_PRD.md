# MyKiv AI
## Product Requirements Document (PRD)

Version: 1.0.0
Status: Draft
Product: MyKiv AI
Platform: Progressive Web App (PWA)
Target Device: Mobile First
Architecture: AI-First

---

# 1. Product Overview

MyKiv AI adalah AI Relationship & Health Companion yang dirancang khusus untuk membantu pasangan menjaga komunikasi, kesehatan, aktivitas harian, dan kualitas hubungan.

Produk ini dikembangkan sebagai aplikasi pribadi untuk dua pengguna (Rifki dan Mayly) yang menjalani hubungan Long Distance Relationship (LDR) dengan jarak sekitar 70 KM.

Berbeda dengan aplikasi habit tracker atau reminder biasa, seluruh aktivitas pengguna akan menjadi konteks bagi AI untuk menghasilkan rekomendasi yang personal, prediksi kondisi kesehatan, insight hubungan, dan pengingat yang relevan.

MyKiv AI bukan aplikasi chat, bukan media sosial, dan bukan aplikasi kesehatan medis.

MyKiv AI adalah AI Companion.

---

# 2. Product Principles

Seluruh pengembangan produk wajib mengikuti prinsip berikut.

## AI-First

Setiap data yang dikumpulkan harus dapat dimanfaatkan AI untuk menghasilkan insight, rekomendasi, prediksi, atau laporan.

---

## Mobile-First

Seluruh pengalaman pengguna dioptimalkan untuk penggunaan satu tangan pada perangkat mobile.

Desktop hanya sebagai secondary platform.

---

## Private by Design

Seluruh data hubungan, kesehatan, lokasi, dan aktivitas bersifat privat.

Semua data harus dilindungi menggunakan Authentication, Authorization, dan Row Level Security.

---

## Minimal Input, Maximum Insight

Pengguna mengisi data seminimal mungkin.

AI bertanggung jawab menghasilkan nilai maksimal dari data tersebut.

---

## Companion, Not Controller

AI hanya memberikan rekomendasi.

AI tidak mengambil keputusan ataupun memaksa pengguna.

---

# 3. Platform

Application Type

- Progressive Web App

Supported Platform

- Android
- iPhone
- Tablet
- Desktop

Capabilities

- Installable
- Offline Access
- Push Notification
- Background Sync
- Service Worker
- Home Screen
- App Icon
- Splash Screen

---

# 4. Core Modules

MyKiv AI terdiri dari delapan modul utama.

1. Couple Dashboard
2. Smart Health Tracker
3. AI Health Assistant
4. Smart Reminder
5. AI Analytics
6. Couple Life
7. Couple Finance
8. Couple Presence

---

# 5. Feature Requirements

---

## Module 1 — Couple Dashboard

### Objective

Menjadi halaman utama yang menampilkan kondisi kedua pengguna secara real-time.

### Features

- Daily Overview
- Health Summary
- AI Insight
- Today's Reminder
- Couple Activity
- Quick Action
- Recent Activity

### Dashboard Widget

Health Status

Mood

Sleep

Water

Meal

Medicine

Exercise

Upcoming Reminder

AI Recommendation

Partner Status

Quality Time

Today's Summary

### Acceptance Criteria

- Dashboard terbuka kurang dari 2 detik
- Menampilkan data kedua pengguna
- Seluruh widget diperbarui otomatis
- Mendukung offline cache

---

## Module 2 — Smart Health Tracker

### Objective

Mencatat seluruh aktivitas kesehatan harian pengguna.

Seluruh data menjadi AI Context.

### Sub Module

Meal Tracking

- Breakfast
- Lunch
- Dinner
- Snack

Water Tracking

- Daily Target
- Water Intake
- Remaining Goal

Sleep Tracking

- Sleep Time
- Wake Time
- Sleep Duration
- Sleep Quality

Exercise Tracking

- Walking
- Running
- Gym
- Stretching
- Cycling

Mood Tracking

- Happy
- Neutral
- Sad
- Stress
- Sick
- Tired

Medicine Tracking

- Medicine
- Vitamin
- Supplement
- Reminder

### Business Rules

Health data harus dapat dicatat secara manual.

Health data harus dapat diedit.

Health data tidak boleh hilang ketika offline.

Health data akan disinkronkan ketika koneksi kembali tersedia.

### AI Context

Semua aktivitas kesehatan akan dianalisis AI.

### Acceptance Criteria

- Offline Supported
- Sync Supported
- Realtime Update
- AI Ready

---

## Module 3 — AI Health Assistant

### Objective

Menjadi otak utama MyKiv AI.

### Features

AI Smart Recommendation

AI Health Prediction

AI Mood Prediction

AI Meal Recommendation

AI Exercise Recommendation

AI Sleep Recommendation

AI Couple Coach

Health Insight

### AI Input

Meal

Water

Sleep

Medicine

Mood

Exercise

Reminder

Activity

Expense

Memory

Location

Calendar

### AI Output

Recommendation

Prediction

Insight

Coach

Summary

Warning

### Acceptance Criteria

- AI menghasilkan rekomendasi yang kontekstual
- AI tidak memberikan diagnosis medis
- AI selalu menggunakan data terbaru
- AI memberikan alasan atas setiap rekomendasi

---

## Module 4 — Smart Reminder

### Objective

Memberikan pengingat yang adaptif berdasarkan kebiasaan pengguna.

### Reminder Type

Meal

Water

Medicine

Sleep

Exercise

Couple Activity

Wishlist

Anniversary

Expense

Custom Reminder

### Smart Behaviour

Reminder dapat berubah berdasarkan:

- Jadwal pengguna
- Riwayat aktivitas
- Lokasi
- Kondisi kesehatan
- Rekomendasi AI

### Acceptance Criteria

- Push Notification
- Background Notification
- Offline Notification
- Reminder dapat di-snooze
- Reminder dapat di-reschedule

---

## Module 5 — AI Analytics

### Objective

Menyajikan ringkasan aktivitas dan insight yang mudah dipahami.

### Features

Daily Summary

Weekly Report

Monthly Report

Health Trend

Mood Trend

Sleep Trend

Water Trend

Activity Trend

AI Insight

### Acceptance Criteria

- Grafik mudah dipahami
- Ringkasan dibuat otomatis oleh AI
- Data dapat difilter berdasarkan periode

---

## Module 6 — Couple Life

### Objective

Membantu menjaga kualitas hubungan pasangan.

### Features

Couple Activity

Anniversary Timeline

Wishlist

Photo Memory

AI Memory

### AI Memory

AI dapat mengingat:

- Makanan favorit
- Minuman favorit
- Warna favorit
- Ukuran pakaian
- Tanggal penting
- Tempat favorit
- Hadiah
- Kebiasaan pasangan
- Hal yang disukai
- Hal yang tidak disukai

### Acceptance Criteria

- Timeline otomatis
- AI Memory terus berkembang
- Aktivitas dapat ditambahkan manual

---

## Module 7 — Couple Finance

### Objective

Mencatat pengeluaran bersama secara sederhana.

### Features

Expense Tracking

Expense Category

Monthly Expense

Expense Insight

Budget

AI Spending Insight

### Categories

Food

Transportation

Shopping

Gift

Vacation

Bills

Other

### Acceptance Criteria

- Statistik bulanan
- Grafik pengeluaran
- Insight AI

---

## Module 8 — Couple Presence

### Objective

Mengetahui keberadaan pasangan secara aman dan transparan.

### Features

Live Location

Safe Arrival

Location History

Arrival Notification

### Acceptance Criteria

- Live Location dapat diaktifkan atau dimatikan
- Lokasi hanya dibagikan atas persetujuan pengguna
- Riwayat lokasi dapat dihapus

---

# 6. AI Requirements

AI digunakan sebagai inti sistem.

AI bertugas:

- Menganalisis data
- Memberikan rekomendasi
- Membuat insight
- Membuat laporan
- Mengingat preferensi pasangan
- Membantu menjaga rutinitas sehat
- Membantu menjaga kualitas hubungan

AI tidak diperbolehkan:

- Memberikan diagnosis medis
- Menggantikan dokter
- Mengambil keputusan atas nama pengguna

---

# 7. PWA Requirements

Wajib mendukung:

- Installable
- Offline Mode
- Service Worker
- Push Notification
- Background Sync
- Home Screen
- Splash Screen
- Update Detection

---

# 8. Non Functional Requirements

Performance

- Initial Load < 2 Seconds

Security

- HTTPS
- Supabase Auth
- Row Level Security

Availability

- High Availability

Scalability

- Modular Architecture

Responsive

- Mobile First

Accessibility

- Touch Friendly

---

# 9. Technical Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Next.js Route Handler
- Server Actions

Database

- PostgreSQL
- Supabase

Authentication

- Supabase Auth

Storage

- Supabase Storage

AI

- Gemini 2.5 Flash
- Replicate API

Deployment

- Vercel

---

# 10. Future Roadmap

- Wearable Integration
- Smartwatch Integration
- Voice AI
- AI Voice Call
- Health Device Integration
- Shared Calendar
- Widget Support
- Native Mobile Application
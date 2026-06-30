# MyKiv AI
## Database Specification

Version: 1.0.0

Database: PostgreSQL
Provider: Supabase

---

# 1. Database Architecture

MyKiv AI menggunakan PostgreSQL sebagai database utama.

Seluruh data pengguna, aktivitas kesehatan, AI Memory, reminder, laporan, dan aktivitas pasangan disimpan pada PostgreSQL.

Storage digunakan untuk menyimpan aset seperti foto, avatar, dan media.

Realtime digunakan untuk sinkronisasi Dashboard antar pasangan.

Authentication menggunakan Supabase Auth.

---

# 2. Design Principles

- Normalized Database
- UUID Primary Key
- Soft Delete
- Audit Timestamp
- Row Level Security
- AI Context Ready
- Realtime Ready

---

# 3. Database Domains

Database dibagi menjadi beberapa domain.

## Authentication

- users
- couples

---

## Health

- health_logs
- medicines

---

## AI

- ai_memory
- ai_conversations
- ai_reports

---

## Reminder

- reminders
- reminder_logs

---

## Couple

- couple_activities
- anniversaries
- wishlists

---

## Finance

- expenses

---

## Presence

- locations

---

## Media

- photos

---

# 4. Entity Overview

users

↓

couples

↓

health_logs

↓

AI

↓

reports

Seluruh entity saling terhubung melalui user_id dan couple_id.

---

# 5. Table Specification

---

## users

Deskripsi

Menyimpan profil pengguna.

Fields

- id
- couple_id
- full_name
- email
- avatar
- birth_date
- gender
- timezone
- created_at
- updated_at

---

## couples

Deskripsi

Relasi dua pengguna.

Fields

- id
- partner_a
- partner_b
- anniversary_date
- relationship_status
- created_at

---

## health_logs

Deskripsi

Seluruh aktivitas kesehatan.

Fields

- id
- user_id
- type
- value
- unit
- datetime
- note
- created_at

type

meal

water

sleep

exercise

medicine

mood

---

## medicines

Fields

- id
- user_id
- name
- dosage
- schedule
- active

---

## reminders

Fields

- id
- user_id
- category
- title
- description
- reminder_time
- repeat_type
- ai_generated
- status

---

## reminder_logs

Fields

- id
- reminder_id
- sent_at
- opened_at
- completed

---

## ai_memory

Deskripsi

Long-term Memory AI.

Fields

- id
- couple_id
- category
- title
- content
- importance
- source
- created_at

Category

favorite_food

favorite_drink

favorite_place

favorite_color

important_date

gift

habit

goal

personality

preference

---

## ai_conversations

Fields

- id
- user_id
- prompt
- response
- token_usage
- latency
- created_at

---

## ai_reports

Fields

- id
- user_id
- type
- period
- summary
- recommendation
- generated_at

---

## couple_activities

Fields

- id
- couple_id
- category
- title
- description
- activity_date
- created_at

---

## anniversaries

Fields

- id
- couple_id
- title
- event_date
- reminder_before

---

## wishlists

Fields

- id
- couple_id
- title
- category
- progress
- completed

---

## expenses

Fields

- id
- couple_id
- category
- amount
- description
- expense_date

---

## locations

Fields

- id
- user_id
- latitude
- longitude
- accuracy
- recorded_at

---

## photos

Fields

- id
- couple_id
- storage_path
- caption
- taken_at

---

# 6. Relationship

users

↓

1 Couple

↓

Many Health Logs

↓

Many Reminders

↓

Many AI Conversations

↓

Many Locations

Couple

↓

Many Activities

↓

Many Wishlist

↓

Many Photos

↓

Many Anniversary

↓

Many AI Memory

↓

Many Expense

---

# 7. Row Level Security

Semua tabel wajib menggunakan RLS.

Rule

User hanya dapat membaca data miliknya.

Partner hanya dapat membaca data yang diizinkan.

Tidak ada data yang bersifat public.

---

# 8. Storage

Bucket

avatars

health-images

photos

attachments

---

# 9. Realtime

Realtime digunakan pada

Dashboard

Reminder

Live Location

Health Update

AI Recommendation

---

# 10. Index

Index wajib dibuat pada

user_id

couple_id

datetime

created_at

category

type

---

# 11. Trigger

Trigger

created_at

updated_at

Soft Delete

Realtime Sync

AI Queue

---

# 12. AI Context Mapping

AI menggunakan data berikut.

Health

- health_logs

Reminder

- reminders

Relationship

- couple_activities

Finance

- expenses

Location

- locations

Memory

- ai_memory

Conversation

- ai_conversations

AI akan menghasilkan

Recommendation

Prediction

Insight

Summary

Reminder

Coach

Report

---

# 13. Future Tables

notifications

health_devices

voice_notes

calendar_events

wearables

ai_embeddings
# MyKiv AI

# AI Architecture

Version 1.0.0

Provider

Replicate

Model

Gemini Flash 2.5

Architecture

AI First

---

# 1. AI Philosophy

AI bukan chatbot.

AI bukan search engine.

AI adalah Companion.

Seluruh AI dirancang untuk memahami kebiasaan pengguna, membantu menjaga kesehatan, meningkatkan kualitas hubungan, serta memberikan rekomendasi yang relevan berdasarkan konteks kehidupan pengguna.

AI tidak menggantikan dokter.

AI tidak menggantikan pasangan.

AI hanya membantu pengguna mengambil keputusan yang lebih baik.

---

# 2. AI Responsibilities

AI memiliki tanggung jawab utama.

- Recommendation
- Prediction
- Coach
- Insight
- Summary
- Memory
- Reminder
- Report

---

# 3. AI Modules

## AI Recommendation Engine

Memberikan rekomendasi berdasarkan seluruh aktivitas pengguna.

Input

- Meal
- Water
- Sleep
- Mood
- Exercise
- Medicine
- Reminder
- Calendar
- Location
- Weather (Future)

Output

- Daily Recommendation
- Health Recommendation
- Relationship Recommendation

---

## AI Prediction Engine

Melakukan prediksi sederhana.

Prediction

- Sleep Pattern

- Mood Pattern

- Hydration Pattern

- Activity Pattern

- Relationship Pattern

AI tidak melakukan diagnosis medis.

---

## AI Couple Coach

Memberikan saran berdasarkan kondisi pengguna.

Contoh

User

"Aku capek."

AI membaca

- Sleep

- Meal

- Water

- Mood

Kemudian memberikan jawaban berdasarkan data.

---

## AI Memory Engine

AI mengingat informasi penting.

Favorite Food

Favorite Drink

Favorite Place

Favorite Movie

Favorite Song

Favorite Color

Favorite Gift

Important Date

Habit

Preference

Dislike

Dream

Goals

Personality

Memory dapat bertambah seiring waktu.

---

## AI Analytics Engine

Membuat

Daily Summary

Weekly Summary

Monthly Summary

Relationship Insight

Health Insight

---

# 4. AI Context Engine

Seluruh AI menggunakan Context Engine.

Context adalah gabungan seluruh data pengguna.

Context Sources

Health

Reminder

Calendar

Activity

Expense

Memory

Location

Photo

Relationship

Semua context diproses sebelum dikirim ke Gemini.

---

# 5. AI Memory

Memory dibagi menjadi beberapa jenis.

## Short Term Memory

Percakapan hari ini.

TTL

24 Jam

---

## Session Memory

Selama sesi chat berlangsung.

TTL

Session

---

## Long Term Memory

Disimpan permanen.

Berisi

Preference

Habit

Favorite

Important Information

Goal

Dream

Personality

Relationship History

---

# 6. AI Context Priority

Priority

Health

40%

Relationship

25%

Reminder

10%

Memory

10%

Calendar

5%

Expense

5%

Location

5%

Priority digunakan saat AI memilih informasi yang paling relevan untuk dijadikan konteks.

---

# 7. AI Workflow

User Input

↓

Context Builder

↓

Memory Loader

↓

Prompt Builder

↓

Gemini Flash

↓

Response Validation

↓

Formatter

↓

Response

---

# 8. Prompt Pipeline

Setiap request AI melalui beberapa tahap.

Step 1

Load User Context

↓

Step 2

Load Couple Context

↓

Step 3

Load Long Term Memory

↓

Step 4

Load Recent Activities

↓

Step 5

Generate Prompt

↓

Step 6

Call Gemini

↓

Step 7

Validate Response

↓

Step 8

Save Conversation

↓

Step 9

Generate Insight

---

# 9. Prompt Template

Setiap prompt wajib memiliki struktur berikut.

Role

Context

Current User State

Partner State

Instruction

Constraints

Expected Output

---

# 10. AI Output Format

Semua output AI menggunakan format JSON.

{
    "summary": "",
    "recommendation": [],
    "prediction": [],
    "warning": [],
    "confidence": 0,
    "reasoning": []
}

---

# 11. AI Safety Rules

AI tidak boleh

- Diagnosis Penyakit
- Memberikan Resep Obat
- Memberikan Dosis Obat
- Menggantikan Dokter
- Mengambil Keputusan Pengguna
- Menampilkan Data Partner Tanpa Izin

---

# 12. AI Learning

AI akan belajar dari

- Habit

- Reminder Completion

- Sleep Pattern

- Meal Pattern

- Mood Pattern

- Exercise Pattern

- Expense Pattern

- Couple Activity

Semakin lama digunakan maka AI semakin personal.

---

# 13. AI Notification

AI dapat membuat notifikasi otomatis.

Contoh

Belum minum selama 3 jam.

↓

Push Notification

---

Tidur terlalu larut selama 4 hari.

↓

Sleep Recommendation

---

Pasangan belum makan.

↓

Reminder

---

Anniversary besok.

↓

AI Suggestion

---

# 14. Future AI

Voice Conversation

Emotion Detection

Camera Food Recognition

Smartwatch Integration

Heart Rate Analysis

Stress Detection

Image Analysis

Wearable AI

Voice Companion

AI Call Assistant
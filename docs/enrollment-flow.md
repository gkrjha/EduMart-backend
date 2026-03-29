# Enrollment / Purchase System Flow

## Overview

Teacher apna course create karta hai. Student ya doosra Teacher us course ko purchase karta hai. Purchase ke baad hi course ka content (videos/PDFs) access hota hai.

---

## Actors

- Admin — platform manage karta hai
- Teacher — course create karta hai, doosre teachers ke courses purchase kar sakta hai
- Student — courses purchase karta hai

---

## Flow

### 1. Course Create (Teacher)
- Teacher login karta hai
- Naya course create karta hai with title, description, price
- Course ke andar content (videos/PDFs) add karta hai

### 2. Course Purchase (Student ya Teacher)
- User course listing dekhta hai
- Kisi course ko purchase karna chahta hai
- System check karta hai:
  - Kya user pehle se enrolled hai? Agar haan — error
  - Kya teacher apna khud ka course purchase kar raha hai? — free access milega
- Payment process hoti hai
- Enrollment record create hota hai with status = active
- User ko confirmation milti hai

### 3. Content Access
- User enrolled courses mein jaata hai
- System enrollment check karta hai
- Agar enrolled hai aur status = active — content milta hai
- Agar enrolled nahi — 403 Forbidden

---

## Enrollment Entity

| Field          | Type    | Description                        |
|----------------|---------|------------------------------------|
| id             | uuid    | Primary key                        |
| course_id      | uuid    | Kaunsa course purchase hua         |
| student_id     | uuid    | Student ne purchase kiya (nullable)|
| teacher_id     | uuid    | Teacher ne purchase kiya (nullable)|
| purchaser_type | enum    | student / teacher                  |
| amount_paid    | decimal | Kitna pay kiya                     |
| status         | enum    | pending / active / expired         |
| enrolled_at    | date    | Kab purchase hua                   |

---

## Rules

- Ek user ek course sirf ek baar purchase kar sakta hai (unique constraint)
- Teacher apna khud ka course free mein access kar sakta hai (enrollment nahi banta, direct access)
- Course delete hone par enrollment bhi delete hoti hai (CASCADE)
- Content sirf active enrollment pe accessible hai

---

## API Endpoints (Planned)

| Method | Endpoint                        | Access         | Description                  |
|--------|---------------------------------|----------------|------------------------------|
| POST   | /api/v1/enrollments             | Student/Teacher| Course purchase karo         |
| GET    | /api/v1/enrollments/my-courses  | Student/Teacher| Apne purchased courses dekho |
| GET    | /api/v1/enrollments/:courseId/access | Student/Teacher | Content access check    |
| GET    | /api/v1/enrollments             | Admin          | Saari enrollments dekho      |

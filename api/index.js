// api/index.js

// --- 1. เรียกใช้เครื่องมือและส่วนประกอบทั้งหมด ---
const express = require('express');
const cors = require('cors');
const diagnosisRoutes = require('../src/api/routes/diagnosis.routes'); // <-- Import Route
const errorHandler = require('../src/api/middlewares/errorHandler.middleware'); // <-- Import Error Handler

// --- 2. สร้าง Application หลัก ---
const app = express();

// --- 3. กำหนดค่า Middlewares พื้นฐาน ---
app.use(cors());
app.use(express.json());

// --- 4. ติดตั้ง Routes ---
// บอกให้ Application รู้ว่า ทุก request ที่ขึ้นต้นด้วย '/api/diagnosis'
// ให้ส่งต่อไปให้ 'diagnosisRoutes' จัดการ
app.use('/api/diagnosis', diagnosisRoutes);

// --- 5. สร้าง Route ทดสอบ (ยังคงมีประโยชน์) ---
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'AI Diagnostic API is running!' });
});

// --- 6. ติดตั้ง Error Handler ---
// **สำคัญมาก:** Error Handler ต้องถูก 'use' เป็นลำดับสุดท้าย
// หลังจาก Routes ทั้งหมด เพื่อที่มันจะสามารถดักจับ error จากทุกส่วนได้
app.use(errorHandler);

// --- 7. ส่งออก Application ---
module.exports = app;
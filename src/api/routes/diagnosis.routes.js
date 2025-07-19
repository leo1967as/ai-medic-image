// src/api/routes/diagnosis.routes.js

// --- 1. เรียกใช้เครื่องมือที่จำเป็น ---
const express = require('express');
const multer = require('multer');
const diagnosisController = require('../controllers/diagnosis.controller');

// สร้าง Router instance ซึ่งเป็นเหมือน "แผงวงจรย่อย" ของ Express
const router = express.Router();

// --- 2. ตั้งค่า Multer (ด่านตรวจไฟล์) ---

// 2.1) กำหนดวิธีการจัดเก็บไฟล์: เราจะเก็บไว้ใน "หน่วยความจำ" (Memory)
// เพราะในสภาพแวดล้อม Serverless เราไม่ควรบันทึกไฟล์ลงดิสก์
const storage = multer.memoryStorage();

// 2.2) กำหนดตัวกรองไฟล์ (File Filter)
const fileFilter = (req, file, cb) => {
  // เราจะตรวจสอบ 'mimetype' ของไฟล์ ซึ่งบอกประเภทของไฟล์นั้นๆ
  if (file.mimetype.startsWith('image/')) {
    // ถ้าเป็นไฟล์รูปภาพ (เช่น image/jpeg, image/png)
    cb(null, true); // อนุญาตให้ไฟล์ผ่านไปได้
  } else {
    // ถ้าไม่ใช่ไฟล์รูปภาพ
    // สร้าง Error object ขึ้นมาใหม่เพื่อให้ข้อมูลที่ชัดเจน
    const error = new Error('Invalid file type. Only images are allowed.');
    error.statusCode = 400; // 400 Bad Request
    cb(error, false); // ไม่อนุญาตให้ไฟล์ผ่าน และส่ง error กลับไป
  }
};

// 2.3) สร้าง Middleware ของ Multer จากการตั้งค่าข้างต้น
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // กำหนดขนาดไฟล์สูงสุดที่ 5MB (5 * 1024 * 1024 bytes)
    // เพื่อป้องกันการอัปโหลดไฟล์ที่ใหญ่เกินไป
    fileSize: 5 * 1024 * 1024,
  },
});

// --- 3. กำหนด Route หลัก ---

// สร้าง Endpoint สำหรับรับ POST request ที่ path '/' (ซึ่งจะกลายเป็น /api/diagnosis/ ในภายหลัง)
// เราจะใส่ Middleware 'upload' เข้าไป "คั่นกลาง"
router.post(
  '/',
  upload.array('diagnosticImages', 5),  // <-- Multer จะทำงานตรงนี้
  diagnosisController.uploadAndDiagnose,// <-- เปลี่ยนจากฟังก์ชันชั่วคราวเป็น Controller จริง
  (req, res) => {
    // นี่คือ Controller ชั่วคราวที่เราจะสร้างขึ้นเพื่อทดสอบ
    // 1. ตรวจสอบว่า multer ทำงานสำเร็จและสร้าง req.file ให้เราหรือไม่
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // 2. ถ้าสำเร็จ ส่งข้อมูลเบื้องต้นของไฟล์กลับไปเพื่อยืนยัน
    res.status(200).json({
      message: 'File uploaded successfully! Ready for diagnosis.',
      fileInfo: {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  }
);

// --- 4. ส่งออก Router ---
module.exports = router;
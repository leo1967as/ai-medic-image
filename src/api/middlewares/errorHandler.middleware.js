// src/api/middlewares/errorHandler.middleware.js

/**
 * Middleware สำหรับจัดการข้อผิดพลาดทั้งหมดในที่เดียว
 * ฟังก์ชัน Error Handler ของ Express จะมี 4 พารามิเตอร์ (err, req, res, next)
 */
function errorHandler(err, req, res, next) {
    // กำหนดค่า status code เริ่มต้น
    // หาก error ที่เข้ามามี statusCode ที่เรากำหนดไว้ (เช่น 400 จาก Controller) ก็ใช้ค่านั้น
    // หากไม่มี ให้ใช้ 500 Internal Server Error เป็นค่าเริ่มต้น
    const statusCode = err.statusCode || 500;
  
    // Log error ลงใน console ของเซิร์ฟเวอร์เพื่อการดีบัก
    // ในระบบจริงอาจจะใช้ Logger ที่ซับซ้อนกว่านี้
    console.error(err.message, err.stack);
  
    // ส่ง response ที่เป็น JSON กลับไปให้ผู้ใช้
    res.status(statusCode).json({
      message: err.message || 'An unexpected error occurred on the server.',
      // เพื่อความปลอดภัย เราจะแสดง stack trace เฉพาะในโหมด development เท่านั้น
      // เราจะเพิ่มการตั้งค่า NODE_ENV ในภายหลัง
      stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞',
    });
  }
  
  module.exports = errorHandler;
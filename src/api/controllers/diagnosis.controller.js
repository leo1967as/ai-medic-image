// src/api/controllers/diagnosis.controller.js

// --- 1. เรียกใช้ผู้เชี่ยวชาญ (Service) ---
// Controller จะต้องรู้จัก Service ที่ตัวเองต้องเรียกใช้
const diagnosisService = require('../../core/services/diagnosis.service');

// --- 2. สร้างคลาส Controller ---
class DiagnosisController {

  /**
   * นี่คือ Method ที่จะถูกเรียกโดยตรงจาก Route
   * เราใส่ 'async' เพราะมันต้อง 'await' การทำงานของ Service
   * @param {object} req - The Express request object (มี req.file จาก multer)
   * @param {object} res - The Express response object (ใช้ส่งคำตอบกลับ)
   * @param {function} next - The Express next middleware function (ใช้ส่งต่อ error)
   */
  async uploadAndDiagnose(req, res, next) {
    try {
      // 2.1) ตรวจสอบ Input เบื้องต้น
      // แม้ว่า Route จะมี Logic คล้ายๆ กัน แต่การตรวจสอบใน Controller
      // ก็เป็นหลักการป้องกันที่ดี (Defensive Programming)
      if (!req.files || req.files.length === 0) {
        // สร้าง Error ที่มี status code เพื่อให้ Error Handler จัดการได้
        const error = new Error('No image file uploaded.');
        error.statusCode = 400; // 400 Bad Request
        throw error;
      }
      const { symptoms } = req.body; // เราพยายามจะดึง 'symptoms' จาก req.body

      // 2.2) มอบหมายงานให้ Service
      // ส่งอ็อบเจ็กต์ไฟล์ที่ได้จาก multer ไปให้ Service ทั้งก้อน
      // แล้วใช้ 'await' เพื่อรอจนกว่า Service จะวิเคราะห์เสร็จ
      const aiResult = await diagnosisService.diagnoseFromImage(req.files, symptoms);
      res.status(201).json(aiResult);

      // 2.3) จัดรูปแบบและส่งคำตอบสำเร็จกลับไป
      // เมื่อได้ผลลัพธ์จาก Service แล้ว ก็นำมาใส่ในโครงสร้าง response ที่สวยงาม

    } catch (error) {
      // 2.4) จัดการข้อผิดพลาด
      // หากมี Error เกิดขึ้นใน 'try' block (ไม่ว่าจาก Controller เอง หรือจาก Service)
      // มันจะถูกจับ (catch) ที่นี่ และเราจะส่งต่อให้ 'next' middleware จัดการ
      // ซึ่งก็คือ Error Handler ที่เราจะสร้างในขั้นตอนต่อไป
      next(error);
    }
  }
}

// --- 3. ส่งออก instance ของคลาส ---
// ใช้รูปแบบ Singleton เช่นเดียวกับ Service
module.exports = new DiagnosisController();
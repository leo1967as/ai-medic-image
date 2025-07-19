// src/core/services/diagnosis.service.js

// --- 1. เรียกใช้เครื่องมือที่จำเป็น ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config'); // ตัวจัดการ Config ที่เราสร้างไว้ในขั้นตอนที่ 2

// --- 2. ตั้งค่าและตรวจสอบ Gemini API ---

// ตรวจสอบว่า API Key ถูกโหลดมาอย่างถูกต้องหรือไม่
if (!config.gemini.apiKey) {
  // หากไม่มี Key ให้หยุดการทำงานทันทีพร้อมแจ้งข้อผิดพลาดที่ชัดเจน
  throw new Error("Gemini API key is missing. Please check your .env file and configuration.");
}
// สร้าง instance ของ GoogleGenerativeAI ด้วย API Key ของเรา
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// --- 3. สร้างคลาส Service ---
// การใช้คลาสช่วยให้โค้ดเป็นระเบียบและง่ายต่อการจัดการ
class DiagnosisService {

  /**
   * นี่คือ Method หลักที่จะทำหน้าที่วิเคราะห์รูปภาพ
   * เราใส่ 'async' เพราะการเรียก API ภายนอกต้องใช้เวลาและเราต้องรอ
   * @param {object} fileObject - อ็อบเจ็กต์ไฟล์ที่ได้จาก multer
   * @returns {Promise<object>} - ผลลัพธ์การวินิจฉัยที่ถูกจัดรูปแบบ
   */
  async diagnoseFromImage(fileObject) {
    // เลือกโมเดล Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // สร้าง Prompt ที่ชัดเจนและมีประสิทธิภาพ
    const prompt = `
      คุณคือผู้ช่วยวินิจฉัยทางการแพทย์ที่มีความเชี่ยวชาญด้านโรคผิวหนังจากการวิเคราะห์ภาพ
      ผู้ใช้งานได้อัปโหลดรูปภาพของสภาพผิวหนังมาให้

      งานของคุณคือ:
      1. วิเคราะห์ภาพที่ได้รับอย่างละเอียด
      2. ระบุโรคหรือภาวะที่เป็นไปได้มากที่สุด
      3. ประเมินความน่าจะเป็น (Confidence Score) เป็นตัวเลขทศนิยมระหว่าง 0.0 ถึง 1.0
      4. ให้คำแนะนำเบื้องต้นที่ชัดเจนและปลอดภัยสำหรับผู้ป่วย
      5. ต้องมีคำเตือนเสมอว่านี่เป็นเพียงการวินิจฉัยเบื้องต้นและผู้ใช้ควรปรึกษาแพทย์เพื่อการยืนยันผล

      ข้อกำหนดในการตอบกลับที่สำคัญที่สุด:
      - คุณต้องตอบกลับเป็น JSON object ที่ถูกต้องเท่านั้น
      - ห้ามมีข้อความอื่นใดๆ นอกเหนือจาก JSON object นี้เด็ดขาด
      - โครงสร้างของ JSON ต้องเป็นดังนี้ทุกครั้ง:
      {
        "disease": "ชื่อโรคหรือภาวะที่เป็นไปได้",
        "confidence": 0.85,
        "advice": "คำแนะนำเบื้องต้น และคำเตือนให้ไปพบแพทย์"
      }
    `;

    // เตรียมข้อมูลรูปภาพสำหรับส่งให้ API
    const imagePart = {
      inlineData: {
        data: fileObject.buffer.toString("base64"), // แปลงข้อมูลไบนารีของภาพเป็น Base64 string
        mimeType: fileObject.mimetype,
      },
    };

    // ส่ง Request ไปยัง Gemini API (ทั้ง Prompt และ รูปภาพ) และรอคำตอบ
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const textResponse = response.text();

    // พยายามแปลงข้อความที่ได้จาก AI ให้เป็น JSON
    try {
      const jsonResult = JSON.parse(textResponse);
      return jsonResult; // ส่งผลลัพธ์ที่เป็น JSON กลับไป
    } catch (error) {
      console.error("Error: Failed to parse Gemini API response into JSON.", textResponse);
      // หากแปลงไม่ได้ ให้โยน Error ใหม่เพื่อให้ระดับบนจัดการต่อไป
      throw new Error("The AI response was not in the expected JSON format.");
    }
  }
}

// --- 4. ส่งออก instance ของคลาส ---
// เราสร้าง instance ของคลาสนี้ไว้เลยเพียงตัวเดียว (Singleton Pattern)
// เพื่อให้ทั้งแอปพลิเคชันใช้ "ผู้เชี่ยวชาญ" คนเดียวกัน
module.exports = new DiagnosisService();
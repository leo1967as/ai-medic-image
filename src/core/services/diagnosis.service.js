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
   * @param {object} fileObjects - อ็อบเจ็กต์ไฟล์ที่ได้จาก multer
   * @returns {Promise<object>} - ผลลัพธ์การวินิจฉัยที่ถูกจัดรูปแบบ
   */
  async diagnoseFromImage(fileObjects, symptomsText) {
    // เลือกโมเดล Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // สร้าง Prompt ที่ชัดเจนและมีประสิทธิภาพ
    const prompt = `
    คุณคือ AI ผู้ช่วยคัดกรองทางการแพทย์เบื้องต้น (AI Medical Triage Assistant) ที่มีความระมัดระวังและเน้นความปลอดภัยสูงสุด
  
    **เป้าหมายหลัก:** ประเมินความเสี่ยงจากข้อมูลที่ได้รับ และให้คำแนะนำที่ปลอดภัยที่สุดแก่ผู้ใช้ ไม่ใช่การวินิจฉัยโรคให้แม่นยำที่สุด
  
    **เงื่อนไขธงแดง (Red Flag Conditions) ที่ต้องตรวจสอบเป็นอันดับแรก:**
    คุณต้องตรวจสอบอย่างละเอียดว่าข้อมูลที่ได้รับเข้าข่ายเงื่อนไขที่อาจเป็นอันตรายถึงชีวิตหรือไม่ ดังต่อไปนี้:
    - **รอยกัดหรือต่อย:** มีลักษณะเป็นรอยเขี้ยว 2 จุด, รอยแผลลึก, หรือผู้ป่วยสงสัยว่าอาจถูกสัตว์มีพิษกัด/ต่อย (เช่น งู, แมงมุมพิษ, ตะขาบ, แมงป่อง)
    - **การติดเชื้อรุนแรง:** มีอาการบวมแดงร้อนอย่างรวดเร็ว, มีหนองจำนวนมาก, มีเส้นสีแดงลากออกจากแผล
    - **อาการแพ้รุนแรง (Anaphylaxis):** ผู้ป่วยแจ้งว่ามีอาการร่วม เช่น หายใจลำบาก, ปากบวม, หน้าบวม, ผื่นขึ้นทั่วตัวอย่างรวดเร็ว
    - **แผลไฟไหม้/น้ำร้อนลวก:** แผลมีขนาดใหญ่, ลึก, หรือมีสีขาว/ดำคล้ำ
    - **รอยโรคที่น่าสงสัยมะเร็งผิวหนัง:** ไฝหรือปานที่รูปร่างเปลี่ยนไป, ขอบไม่ชัด, มีหลายสี, หรือมีเลือดออก
  
    **โปรโตคอลความปลอดภัย (Safety Protocol):**
    **ถ้าเคสปัจจุบันเข้าข่าย "เงื่อนไขธงแดง" ข้อใดข้อหนึ่ง:**
    1.  **ให้หยุดกระบวนการวินิจฉัยแยกโรคทันที**
    2.  **ให้คำตอบอันดับที่ 1** เป็นการแจ้งเตือนภาวะฉุกเฉินนั้นๆ โดยตรง
    3.  **ให้ Confidence เป็น 1.0 (100%)** เพื่อสื่อถึงความเร่งด่วน
    4.  **ให้คำแนะนำ (Advice)** ที่ชัดเจนที่สุดคือ **"ให้ไปพบแพทย์หรือไปยังห้องฉุกเฉินโดยด่วนที่สุด"** พร้อมเหตุผลสั้นๆ
    5.  สำหรับอันดับที่ 2 และ 3 ให้ระบุว่าเป็น "ไม่สามารถประเมินได้เนื่องจากเป็นภาวะเร่งด่วน"
  
    **หากไม่เข้าข่ายเงื่อนไขธงแดง:**
    ให้ดำเนินการตาม "กระบวนการคิดที่เป็นระบบ" แบบเดิมเพื่อทำการวินิจฉัยแยกโรคตามปกติ
  
    **กระบวนการคิดที่เป็นระบบ (สำหรับเคสที่ไม่ใช่ธงแดง):**
    - (ส่วนนี้เหมือนเดิม: วิเคราะห์ภาพ, วิเคราะห์ข้อความ, สร้างสมมติฐาน, ประเมิน, สร้างคำแนะนำ)
  
    **งานของคุณ:**
    จงวิเคราะห์ "เคสปัจจุบัน" โดยทำตาม "โปรโตคอลความปลอดภัย" เป็นอันดับแรกเสมอ และสร้างผลลัพธ์เป็น JSON object
  
    **ข้อมูลเคสปัจจุบัน:**
    *   **รูปภาพ:** (คุณจะได้รับรูปภาพต่อจากนี้)
    *   **ข้อมูลจากผู้ป่วย:** "${symptomsText || 'ผู้ป่วยไม่ได้ให้ข้อมูลเพิ่มเติม'}"
    **ข้อกำหนดในการตอบกลับ (Output Format):**
    - ผลลัพธ์ต้องเป็น JSON object ที่สมบูรณ์แบบเท่านั้น ห้ามมีข้อความอื่นใดๆ นอกเหนือจากนี้
    - JSON object ต้องมี key ชื่อ "diagnoses" ซึ่งมีค่าเป็นอาร์เรย์ (Array) ของผลการวินิจฉัย
    - ต้องมีผลการวินิจฉัยในอาร์เรย์ **3 รายการเสมอ** เรียงตามความน่าจะเป็นจากมากไปน้อย
    - แต่ละ object ในอาร์เรย์ "diagnoses" ต้องมีโครงสร้างดังนี้ทุกประการ:
    - ตอบเป็นภาษาไทยเท่านั้น
      {
        "disease": "ชื่อโรคหรือภาวะที่เป็นไปได้ (ภาษาไทย)",
        "confidence": 0.85,
        "reasoning": "อธิบายเหตุผลสั้นๆ จากการสังเกตในภาพว่าทำไมถึงวินิจฉัยเช่นนี้",
        "advice": "คำแนะนำเบื้องต้นที่เฉพาะเจาะจงกับภาวะนั้นๆ และปิดท้ายด้วยคำเตือนให้ไปพบแพทย์เสมอ"
      }  
    `;
    // เตรียมข้อมูลรูปภาพสำหรับส่งให้ API
    const imageParts = fileObjects.map(file => ({
      inlineData: {
        data: file.buffer.toString("base64"), // แปลงข้อมูลไบนารีของภาพเป็น Base64 string
        mimeType: file.mimetype,
      },
    }));

    // ส่ง Request ไปยัง Gemini API (ทั้ง Prompt และ รูปภาพ) และรอคำตอบ
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;

    let textResponse = response.text();
    if (textResponse.startsWith("```json")) {
      console.log("Sanitizing response: Found JSON markdown block.");
      // ลบ ```json ที่ตอนต้น และ ``` ที่ตอนท้าย
      textResponse = textResponse.replace("```json", "").replace("```", "");
    }
    // --- บรรทัดที่เราจะเพิ่มเข้าไปเพื่อ Debug ---
console.log("--- RAW RESPONSE FROM GEMINI ---");
console.log(textResponse);
console.log("-------------------------------");
// -----------------------------------------
    // พยายามแปลงข้อความที่ได้จาก AI ให้เป็น JSON
    try {
      const jsonResult = JSON.parse(textResponse);
      if (!jsonResult.diagnoses || !Array.isArray(jsonResult.diagnoses)) {
        throw new Error("AI response is missing 'diagnoses' array.");
      }
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
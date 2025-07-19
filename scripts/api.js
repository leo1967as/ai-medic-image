// public/scripts/api.js

// 1. กำหนด URL ของ API ที่เราจะเรียกใช้
// ในสภาพแวดล้อม Development (vercel dev) เราจะใช้ localhost
// แต่เมื่อ Deploy จริง เราจะใช้ URL ของ Vercel ซึ่งเป็น Relative Path ได้
const API_URL = '/api/diagnosis';

/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพและขอรับผลการวินิจฉัยจาก API
 * @param {File} imageFile - อ็อบเจ็กต์ไฟล์รูปภาพที่ได้จาก <input type="file">
 * @returns {Promise<object>} - Promise ที่จะ resolve เป็นข้อมูล JSON ที่ได้จาก API
 */
async function uploadImageForDiagnosis(imageFile) {
  // 2. สร้าง FormData object เพื่อใช้ส่งไฟล์
  // นี่คือวิธีมาตรฐานในการส่งไฟล์ผ่าน HTTP Request
  const formData = new FormData();
  // เพิ่มไฟล์เข้าไปใน formData โดยใช้ key 'diagnosticImage'
  // ซึ่งต้องตรงกับที่เรากำหนดไว้ใน multer บนฝั่งเซิร์ฟเวอร์
  formData.append('diagnosticImage', imageFile);

  try {
    // 3. ใช้ fetch API เพื่อส่ง POST request ไปยังเซิร์ฟเวอร์
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData, // ไม่ต้องตั้งค่า 'Content-Type' เอง เบราว์เซอร์จะจัดการให้เมื่อใช้ FormData
    });

    // 4. แปลง response ที่ได้กลับมาเป็น JSON
    const result = await response.json();

    // 5. ตรวจสอบว่า API ตอบกลับมาว่าสำเร็จหรือไม่
    // response.ok จะเป็น true สำหรับ status code 200-299
    if (!response.ok) {
      // หากไม่สำเร็จ (เช่น status 400, 500)
      // ให้โยน Error พร้อมกับข้อความที่ได้จาก API
      // เพื่อให้ส่วนที่เรียกใช้ฟังก์ชันนี้สามารถ catch ไปจัดการต่อได้
      throw new Error(result.message || 'An unknown error occurred.');
    }

    // 6. หากทุกอย่างสำเร็จ คืนค่าข้อมูล (data) ที่อยู่ในผลลัพธ์
    return result.data;

  } catch (error) {
    // 7. หากเกิดข้อผิดพลาดระหว่างการเชื่อมต่อ (เช่น network down)
    // หรือข้อผิดพลาดที่โยนมาจากข้างบน ให้โยนต่อไปอีกทอด
    // เพื่อให้แน่ใจว่าผู้เรียกใช้จะได้รับ Error เสมอเมื่อมีปัญหา
    console.error('API Error:', error);
    throw error;
  }
}

// 8. ส่งออก (export) ฟังก์ชันนี้เพื่อให้ไฟล์อื่นสามารถ import ไปใช้งานได้
export { uploadImageForDiagnosis };
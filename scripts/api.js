// public/scripts/api.js
const API_URL = '/api/diagnosis';

// รับพารามิเตอร์เป็นอาร์เรย์ของไฟล์
async function uploadImageForDiagnosis(imageFiles, symptomsText) {
  const formData = new FormData();
  // วนลูปเพื่อเพิ่มไฟล์ทั้งหมดลงใน key เดียวกัน
  for (const file of imageFiles) {
    // ใช้ key 'diagnosticImages' ที่ตรงกับฝั่งเซิร์ฟเวอร์
    formData.append('diagnosticImages', file);
  }
  formData.append('symptomsText', symptomsText);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'An unknown error occurred.');
    }
    // คืนค่า result ทั้งก้อน ไม่ใช่แค่ .data
    return result; 
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export { uploadImageForDiagnosis };
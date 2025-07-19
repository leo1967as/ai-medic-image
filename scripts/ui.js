// public/scripts/ui.js

// --- 1. ดึง Element ที่ต้องใช้งานบ่อยๆ มาเก็บไว้ในตัวแปร ---
// การทำแบบนี้ช่วยให้โค้ดอ่านง่ายขึ้นและมีประสิทธิภาพดีกว่าการ query ซ้ำๆ
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');
const loader = document.getElementById('loader');
const errorElement = document.getElementById('error');
const fileNameElement = document.getElementById('fileName');
const submitButton = document.getElementById('submitButton');

// --- 2. สร้างฟังก์ชันสำหรับจัดการสถานะต่างๆ ของ UI ---

/**
 * แสดงสถานะกำลังโหลด (Loading State)
 * ซ่อนผลลัพธ์เก่าและข้อผิดพลาด, แสดง Loader, และปิดการใช้งานปุ่ม
 */
function showLoading() {
  resultContainer.hidden = false; // แสดงกล่องผลลัพธ์หลัก
  resultContent.hidden = true;
  errorElement.hidden = true;
  loader.hidden = false; // แสดงตัวหมุน
  submitButton.disabled = true;
  submitButton.textContent = 'กำลังวินิจฉัย...';
}

/**
 * แสดงผลลัพธ์ที่ได้จาก API
 * @param {object} data - อ็อบเจ็กต์ข้อมูลที่ได้จาก API (มี aiResult และ fileInfo)
 */
function showResult(data) {
  loader.hidden = true; // ซ่อนตัวหมุน
  errorElement.hidden = true;
  resultContent.hidden = false; // แสดงพื้นที่เนื้อหาผลลัพธ์

  // สร้าง HTML จากข้อมูลที่ได้รับ
  resultContent.innerHTML = `
    <p><strong>ไฟล์:</strong> ${data.fileInfo.name}</p>
    <p><strong>ผลการวิเคราะห์:</strong> ${data.aiResult.disease}</p>
    <p><strong>ความน่าจะเป็น:</strong> ${(data.aiResult.confidence * 100).toFixed(0)}%</p>
    <p><strong>คำแนะนำ:</strong> ${data.aiResult.advice}</p>
  `;

  resetSubmitButton();
}

/**
 * แสดงข้อความข้อผิดพลาด
 * @param {string} message - ข้อความ Error ที่จะแสดง
 */
function showError(message) {
  loader.hidden = true; // ซ่อนตัวหมุน
  resultContent.hidden = true;
  errorElement.hidden = false; // แสดงกล่อง Error
  errorElement.textContent = message; // ใส่ข้อความ Error
  resetSubmitButton();
}

/**
 * อัปเดตชื่อไฟล์ที่แสดงบนหน้าจอ
 * @param {string} name - ชื่อไฟล์
 */
function updateFileName(name) {
  fileNameElement.textContent = name;
}

/**
 * เปิดหรือปิดการใช้งานปุ่ม Submit
 * @param {boolean} enabled - true เพื่อเปิดใช้งาน, false เพื่อปิด
 */
function setSubmitButtonEnabled(enabled) {
  submitButton.disabled = !enabled;
}

/**
 * รีเซ็ตปุ่ม Submit กลับสู่สถานะเริ่มต้น
 */
function resetSubmitButton() {
    submitButton.disabled = false;
    submitButton.textContent = 'ส่งเพื่อวินิจฉัย';
}

// --- 3. ส่งออกฟังก์ชันทั้งหมดเพื่อให้ main.js เรียกใช้ได้ ---
export {
  showLoading,
  showResult,
  showError,
  updateFileName,
  setSubmitButtonEnabled
};
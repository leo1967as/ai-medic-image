// public/scripts/main.js

// --- 1. Import ทุกอย่างที่ต้องใช้จากไฟล์อื่น ---
import { uploadImageForDiagnosis } from './api.js';
import {
  showLoading,
  showResult,
  showError,
  updateFileName,
  setSubmitButtonEnabled
} from './ui.js';

// --- 2. ดึง Element ที่ต้องใช้ในการเพิ่ม Event Listener ---
const imageUploadInput = document.getElementById('imageUpload');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');

// --- 3. สร้างตัวแปรสำหรับเก็บสถานะ (State Management) ---
// เราต้องการตัวแปรหนึ่งตัวเพื่อเก็บไฟล์ที่ผู้ใช้เลือกไว้
let selectedFile = null;

// --- 4. กำหนด Event Listeners (หัวใจของการโต้ตอบ) ---

// Event Listener สำหรับปุ่ม "เลือกรูปภาพ"
uploadButton.addEventListener('click', () => {
  // เมื่อคลิกปุ่มนี้ ให้ไปกระตุ้นการคลิกที่ input file ที่ซ่อนอยู่
  imageUploadInput.click();
});

// Event Listener สำหรับ input file เอง
imageUploadInput.addEventListener('change', (event) => {
  // 'event.target.files' จะเป็นรายการไฟล์ที่ผู้ใช้เลือก
  const file = event.target.files[0];
  if (file) {
    selectedFile = file; // เก็บไฟล์ที่เลือกไว้ในตัวแปรของเรา
    updateFileName(file.name); // สั่งให้ UI อัปเดตชื่อไฟล์
    setSubmitButtonEnabled(true); // สั่งให้ UI เปิดใช้งานปุ่ม Submit
  }
});

// Event Listener สำหรับปุ่ม "ส่งเพื่อวินิจฉัย"
submitButton.addEventListener('click', async () => {
  // ตรวจสอบอีกครั้งว่ามีไฟล์ที่ถูกเลือกหรือไม่
  if (!selectedFile) {
    showError('กรุณาเลือกรูปภาพก่อนส่ง');
    return;
  }

  // --- นี่คือ Flow การทำงานหลัก ---
  try {
    // 1. สั่งให้ UI แสดงสถานะกำลังโหลด
    showLoading();

    // 2. สั่งให้ API อัปโหลดไฟล์และรอผลลัพธ์ (ใช้ await)
    const resultData = await uploadImageForDiagnosis(selectedFile);

    // 3. เมื่อได้ผลลัพธ์แล้ว สั่งให้ UI แสดงผลลัพธ์นั้น
    showResult(resultData);

  } catch (error) {
    // 4. หากเกิดข้อผิดพลาดขึ้นในขั้นตอนใดๆ (ทั้งจาก API หรือ Network)
    // ให้สั่ง UI แสดงข้อผิดพลาดนั้น
    showError(error.message);
  }
});
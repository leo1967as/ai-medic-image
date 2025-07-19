//scripts/main.js
import { uploadImageForDiagnosis } from './api.js';
import { showLoading, showResult, showError, setSubmitButtonEnabled, displayImagePreviews } from './ui.js';

// --- ดึง Element ใหม่ ---
const imageUploadInput = document.getElementById('imageUpload');
const selectFilesButton = document.getElementById('selectFilesButton');
const takePhotoButton = document.getElementById('takePhotoButton');
const submitButton = document.getElementById('submitButton');
const symptomsInput = document.getElementById('symptomsInput');

// --- State Management ---
let selectedFiles = []; // State หลักที่เก็บไฟล์ทั้งหมด

// --- ฟังก์ชันสำหรับอัปเดต UI ทั้งหมด ---
// ฟังก์ชันนี้จะถูกเรียกทุกครั้งที่ selectedFiles เปลี่ยนแปลง
function updateUI() {
  // 1. แสดงภาพตัวอย่างใหม่ (พร้อมส่งฟังก์ชันลบไปด้วย)
  displayImagePreviews(selectedFiles, handleDeleteFile);
  // 2. เปิด/ปิด ปุ่ม submit
  setSubmitButtonEnabled(selectedFiles.length > 0);
}

// --- ฟังก์ชันจัดการ Event ---

// ฟังก์ชันเพิ่มไฟล์ใหม่เข้ามาใน State
function handleAddFiles(newFiles) {
  // แปลง FileList ให้เป็น Array แล้วนำมาต่อกับอาร์เรย์เดิม
  selectedFiles = selectedFiles.concat(Array.from(newFiles));
  // อัปเดต UI
  updateUI();
}

// ฟังก์ชันลบไฟล์ออกจาก State
function handleDeleteFile(indexToDelete) {
  // สร้างอาร์เรย์ใหม่โดยไม่รวมไฟล์ที่ต้องการลบ
  selectedFiles = selectedFiles.filter((_, index) => index !== indexToDelete);
  // อัปเดต UI
  updateUI();
}

// --- การผูก Event Listeners ---

selectFilesButton.addEventListener('click', () => {
  // แก้ไข input เพื่อให้แน่ใจว่า event 'change' จะทำงานทุกครั้ง
  // แม้จะเลือกไฟล์เดิมซ้ำ
  imageUploadInput.value = ''; 
  imageUploadInput.click();
});

// ฟังก์ชันถ่ายรูป (จะเปิดกล้องบนมือถือ)
takePhotoButton.addEventListener('click', () => {
  // ตั้งค่าให้ input รับภาพจากกล้อง
  imageUploadInput.setAttribute('capture', 'environment');
  imageUploadInput.value = '';
  imageUploadInput.click();
});

imageUploadInput.addEventListener('change', (event) => {
  if (event.target.files.length > 0) {
    handleAddFiles(event.target.files);
  }
  // ลบ attribute 'capture' ออกหลังใช้งานเสร็จ
  imageUploadInput.removeAttribute('capture');
});

submitButton.addEventListener('click', async () => {
  if (selectedFiles.length === 0) {
    showError('กรุณาเลือกรูปภาพก่อนส่ง');
    return;
  }
  try {
    showLoading();
    const symptomsText = symptomsInput.value;
    const resultData = await uploadImageForDiagnosis(selectedFiles, symptomsText);
    showResult(resultData);
  } catch (error) {
    showError(error.message);
  }
});

// จัดการ UI เมื่อผู้ใช้โฟกัสที่ Textarea (เหมือนเดิม)
symptomsInput.addEventListener('focus', () => {
  setTimeout(() => {
    symptomsInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
});
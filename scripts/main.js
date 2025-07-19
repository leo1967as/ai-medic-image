//scripts/main.js
import { uploadImageForDiagnosis } from './api.js';
import { showLoading, showResult, showError, setSubmitButtonEnabled, displayImagePreviews } from './ui.js';

const imageUploadInput = document.getElementById('imageUpload');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
const symptomsInput = document.getElementById('symptomsInput'); // <-- เพิ่มเข้ามา

let selectedFiles = []; // เปลี่ยนเป็นอาร์เรย์

uploadButton.addEventListener('click', () => imageUploadInput.click());

imageUploadInput.addEventListener('change', (event) => {
  // event.target.files เป็น FileList ไม่ใช่อาร์เรย์แท้
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    selectedFiles = files;
    displayImagePreviews(selectedFiles); // แสดงภาพตัวอย่าง
    setSubmitButtonEnabled(true);
  }
});

submitButton.addEventListener('click', async () => {
  if (selectedFiles.length === 0) {
    showError('กรุณาเลือกรูปภาพก่อนส่ง');
    return;
  }
  try {
    showLoading();
    // ส่งอาร์เรย์ของไฟล์ไปให้ API
    const symptomsText = symptomsInput.value; 

    const resultData = await uploadImageForDiagnosis(selectedFiles, symptomsText);
    showResult(resultData);
  } catch (error) {
    showError(error.message);
  }
});

// จัดการ UI เมื่อผู้ใช้โฟกัสที่ Textarea บนมือถือ
symptomsInput.addEventListener('focus', () => {
  // ใช้ setTimeout เพื่อให้แน่ใจว่าคีย์บอร์ดมีเวลาแสดงขึ้นมาก่อน
  setTimeout(() => {
    // เลื่อน Textarea ให้อยู่ในมุมมอง
    symptomsInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300); 
});
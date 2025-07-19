// public/scripts/ui.js

// --- 1. ดึง Element ที่ต้องใช้งานบ่อยๆ มาเก็บไว้ในตัวแปร ---
// การทำแบบนี้ช่วยให้โค้ดอ่านง่ายขึ้นและมีประสิทธิภาพดีกว่าการ query ซ้ำๆ
const resultContainer = document.getElementById('resultContainer');
const diagnosesList = document.getElementById('diagnosesList'); // เปลี่ยนจาก resultContent เป็น diagnosesList
const loader = document.getElementById('loader');
const errorElement = document.getElementById('error');
const fileNameElement = document.getElementById('fileName');
const submitButton = document.getElementById('submitButton');
const imagePreviewContainer = document.getElementById('imagePreviewContainer'); // ใหม่
// --- 2. สร้างฟังก์ชันสำหรับจัดการสถานะต่างๆ ของ UI ---

function displayImagePreviews(files, onDelete) {
  imagePreviewContainer.innerHTML = ''; // เคลียร์ของเก่าทั้งหมด
  
  // วนลูปสร้างภาพตัวอย่างใหม่ทั้งหมดจาก state ปัจจุบัน
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('preview-image-wrapper');

      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('preview-image');
      
      // --- เพิ่มปุ่มลบ ---
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-button');
      deleteBtn.innerHTML = '×'; // เครื่องหมายกากบาท
      deleteBtn.onclick = () => onDelete(index); // เรียกฟังก์ชันลบเมื่อคลิก

      wrapper.appendChild(img);
      wrapper.appendChild(deleteBtn);
      imagePreviewContainer.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * แสดงสถานะกำลังโหลด (Loading State)
 * ซ่อนผลลัพธ์เก่าและข้อผิดพลาด, แสดง Loader, และปิดการใช้งานปุ่ม
 */
function showLoading() {
  resultContainer.hidden = false; // แสดงกล่องผลลัพธ์หลัก
  diagnosesList.hidden = true; // <-- แก้ไขที่นี่
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
  loader.hidden = true;
  errorElement.hidden = true;
  diagnosesList.innerHTML = ''; // เคลียร์ของเก่า
  diagnosesList.hidden = false; // <-- เพิ่มบรรทัดนี้เพื่อให้แน่ใจว่ามันแสดงผล

  if (data.diagnoses && data.diagnoses.length > 0) {
    
    // 1. กรองเอาเฉพาะผลลัพธ์ที่ประเมินได้
    const validDiagnoses = data.diagnoses.filter(diag => 
      diag.disease !== "ไม่สามารถประเมินได้" && diag.disease !== "ไม่สามารถประเมินได้เนื่องจากเป็นภาวะเร่งด่วน"
    );

    // 2. ตรวจสอบว่าหลังจากกรองแล้วยังมีผลลัพธ์เหลืออยู่หรือไม่
    if (validDiagnoses.length > 0) {
      // 3. วนลูปเฉพาะผลลัพธ์ที่ผ่านการกรองแล้ว
      validDiagnoses.forEach((diag, index) => {
        const card = document.createElement('div');
        card.classList.add('diagnosis-card');

        // (ส่วนโค้ดสำหรับตรวจสอบและสร้าง innerHTML เหมือนเดิมทุกประการ)
        const disease = diag.disease || "ไม่ระบุภาวะ";
        const confidence = diag.confidence;
        const reasoning = diag.reasoning || "ไม่มีเหตุผลเพิ่มเติม";
        const advice = diag.advice || "กรุณาปรึกษาแพทย์เพื่อรับคำแนะนำ";
        const confidenceText = (typeof confidence === 'number') 
          ? `${(confidence * 100).toFixed(0)}%` 
          : "N/A";

        card.innerHTML = `
          <h3>อันดับที่ ${index + 1}: ${disease}</h3>
          <p><span class="confidence">ความน่าจะเป็น:</span> ${confidenceText}</p>
          <p><strong>เหตุผลเบื้องต้น:</strong> ${reasoning}</p>
          <p><strong>คำแนะนำ:</strong> ${advice}</p>
        `;
        
        diagnosesList.appendChild(card);
      });
    } else {
      // กรณีที่ AI ตอบว่าเป็นภาวะเร่งด่วนทั้งหมด แล้วถูกกรองออกไปหมด
      showError("ตรวจพบภาวะที่อาจเป็นอันตรายร้ายแรง กรุณาไปพบแพทย์หรือห้องฉุกเฉินโดยด่วนที่สุด");
    }

  } else {
    showError("AI ไม่สามารถให้ผลการวินิจฉัยได้จากรูปภาพที่ให้มา");
  }
  resetSubmitButton();
}

/**
 * แสดงข้อความข้อผิดพลาด
 * @param {string} message - ข้อความ Error ที่จะแสดง
 */
function showError(message) {
  loader.hidden = true; // ซ่อนตัวหมุน
  diagnosesList.hidden = true; // <-- แก้ไขที่นี่
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
  setSubmitButtonEnabled,
  displayImagePreviews,
};
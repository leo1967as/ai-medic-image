// src/config/index.js

// 1. เรียกใช้ไลบรารี dotenv เพื่อให้มันอ่านไฟล์ .env ของเรา
require('dotenv').config();

// 2. สร้าง object สำหรับเก็บค่า config ทั้งหมดอย่างเป็นระเบียบ
const config = {
  gemini: {
    // 3. ดึงค่า API Key จาก 'process.env' ซึ่งเป็นที่ที่ dotenv นำค่ามาใส่ไว้ให้
    apiKey: process.env.GEMINI_API_KEY,
  }
};

// 4. ส่งออก (export) object ที่เราสร้างขึ้น เพื่อให้ไฟล์อื่นในโปรเจกต์สามารถเรียกใช้ได้
module.exports = config;
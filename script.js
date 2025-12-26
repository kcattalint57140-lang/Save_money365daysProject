// กำหนดเป้าหมายรวม และตัวแปรอื่น ๆ
const TOTAL_DAYS = 365;
const GOAL_AMOUNT = (TOTAL_DAYS * (TOTAL_DAYS + 1)) / 2; // 66795
const savingGrid = document.getElementById('saving-grid');
const themeToggle = document.getElementById('theme-toggle');
const themeStorageKey = 'savingAppTheme';

// ----------------------------------------------------------------
// 1. ฟังก์ชันจัดการ Local Storage
// ----------------------------------------------------------------

// บันทึกสถานะการเก็บเงิน
function saveState(state) {
    localStorage.setItem('savingChallengeState', JSON.stringify(state));
}

// โหลดสถานะการเก็บเงิน
function loadState() {
    const savedState = localStorage.getItem('savingChallengeState');
    // หากไม่เคยมีข้อมูล ให้สร้าง Array 1-365 ใหม่
    return savedState ? JSON.parse(savedState) : Array.from({ length: TOTAL_DAYS }, (_, i) => ({
        amount: i + 1, // จำนวนเงินที่ต้องเก็บ (1 ถึง 365)
        isSaved: false // สถานะ: ยังไม่เก็บ
    }));
}

let savingData = loadState(); // โหลดข้อมูลมาใช้งาน

// ----------------------------------------------------------------
// 2. ฟังก์ชันจัดการ Theme (Dark/Light Mode)
// ----------------------------------------------------------------

// โหลดธีมที่บันทึกไว้ หรือใช้ "light" เป็นค่าเริ่มต้น
function loadTheme() {
    return localStorage.getItem(themeStorageKey) || 'light';
}

// ใช้คลาส dark-mode กับ body
function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    
    // อัปเดตข้อความบนปุ่ม
    themeToggle.textContent = isDark ? 'สลับโหมด: 🌙 มืด' : 'สลับโหมด: ☀️ สว่าง';
}

// สลับโหมดเมื่อคลิก
function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // บันทึกและนำไปใช้
    localStorage.setItem(themeStorageKey, newTheme);
    applyTheme(newTheme);
}

// โหลดและใช้ธีมทันทีเมื่อเริ่มต้น
applyTheme(loadTheme());

// เพิ่ม Event Listener ให้กับปุ่มสลับโหมด
themeToggle.addEventListener('click', toggleTheme);

// ----------------------------------------------------------------
// 3. ฟังก์ชันจัดการตารางและการคำนวณ
// ----------------------------------------------------------------

// ฟังก์ชันสร้าง/แสดงตาราง
function renderGrid() {
    savingGrid.innerHTML = ''; // ล้างตารางเดิมออกก่อน
    savingData.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('saving-item');
        itemDiv.textContent = item.amount;
        itemDiv.dataset.index = index; // เก็บ index เพื่อใช้อ้างอิงใน Array

        if (item.isSaved) {
            itemDiv.classList.add('saved'); // เพิ่ม class "saved" ถ้าเก็บแล้ว
        }

        // เพิ่ม Event Listener สำหรับการคลิก
        itemDiv.addEventListener('click', toggleSave);
        
        savingGrid.appendChild(itemDiv);
    });

    updateSummary(); // อัปเดตสรุปผลหลังแสดงตาราง
}

// ฟังก์ชันจัดการการคลิก (ติ๊ก/ยกเลิกการติ๊ก)
function toggleSave(event) {
    const index = event.target.dataset.index;
    const item = savingData[index];

    // ตรวจสอบว่าช่องนี้ถูก "เก็บแล้ว" หรือไม่
    if (item.isSaved) {
        // หากถูกเก็บแล้ว: แสดงกล่องยืนยันก่อนยกเลิก (เปลี่ยนเป็นภาษาอังกฤษ)
        const confirmation = confirm(`Do you want to cancel saving the amount of ${item.amount.toLocaleString()} THB?`);

        if (confirmation) {
            // ผู้ใช้กด OK/ตกลง: ดำเนินการยกเลิกการเก็บ
            item.isSaved = false;
        } else {
            // ผู้ใช้กด Cancel/ยกเลิก: ไม่ทำอะไรเลย และออกจากฟังก์ชัน
            return; 
        }
    } else {
        // หากยังไม่ถูกเก็บ: ดำเนินการเก็บทันทีโดยไม่ต้องถามซ้ำ
        item.isSaved = true;
    }

    // อัปเดตการแสดงผลในหน้าเว็บทันที
    event.target.classList.toggle('saved', item.isSaved);

    saveState(savingData); // บันทึกสถานะใหม่
    updateSummary();      // อัปเดตผลลัพธ์
}


// ฟังก์ชันคำนวณและอัปเดตสรุปผล
function updateSummary() {
    let savedAmount = 0;
    savingData.forEach(item => {
        if (item.isSaved) {
            savedAmount += item.amount;
        }
    });

    const amountNeeded = GOAL_AMOUNT - savedAmount;
    const percentage = (savedAmount / GOAL_AMOUNT) * 100;
    
    // ฟอร์แมตตัวเลขให้มีคอมม่า
    const formatNumber = (num) => num.toLocaleString('en-US'); 

    // อัปเดตค่าใน HTML ด้วยการฟอร์แมต
    document.getElementById('current-saved').textContent = formatNumber(savedAmount);
    document.getElementById('amount-needed').textContent = formatNumber(amountNeeded);
    
    const progressBar = document.getElementById('progress-bar');
    const percentageFixed = percentage.toFixed(2);
    
    progressBar.style.width = `${percentageFixed}%`;
    progressBar.textContent = `${percentageFixed}%`;
    
    // จัดการกรณีที่ยังไม่เริ่มเก็บ
    if (percentageFixed < 5 && percentageFixed > 0) {
        // ให้แถบความคืบหน้าแสดงผลเล็กน้อยเมื่อเริ่มเก็บ เพื่อให้เห็นตัวเลข
        progressBar.style.width = '5%'; 
    } else if (percentageFixed == 0) {
         progressBar.style.width = '0%'; 
         progressBar.textContent = '0%';
    }
}
// เริ่มต้น: โหลดและแสดงตาราง
renderGrid();
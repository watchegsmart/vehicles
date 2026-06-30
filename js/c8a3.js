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

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("formStep4");
  const checkboxes = document.querySelectorAll("input[type='checkbox'][data-name][data-price]");

 
  let existingData = {};
  try {
    const tempData = sessionStorage.getItem('tameeniTempData');
    if (tempData) {
      existingData = JSON.parse(tempData);
    }
  } catch (e) {
    console.error("خطأ في قراءة البيانات المؤقتة:", e);
  }

  
  if (existingData.addons && Array.isArray(existingData.addons)) {
    checkboxes.forEach(cb => {
      const name = cb.dataset.name;
      if (existingData.addons.some(a => a.name === name)) {
        cb.checked = true;
      }
    });
  }

  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const addons = [];
    let addonsTotal = 0;

    checkboxes.forEach(cb => {
      if (cb.checked) {
        const name = cb.dataset.name;
        const price = Number(cb.dataset.price) || 0;
        addons.push({ name, price });
        addonsTotal += price;
      }
    });

   
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
      addons: addons,
      addonsTotal: addonsTotal,
      total: (existingData.planPrice || 0) + addonsTotal
    };

   
    const d = { ...existingData, ...newData };

    
    sessionStorage.setItem('tameeniTempData', JSON.stringify(d));

    (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        window.socket.emit('submitAddon', { ip: ip, addons: addons, addonsTotal: addonsTotal, total: newData.total });
      })();

    window.location.href = "summary.html";
  });
});
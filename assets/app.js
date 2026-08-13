const API = (window.HASA_CONFIG?.BOT_API_URL || "").replace(/\/$/, "");

const $ = (id) => document.getElementById(id);

function show(el, message, ok = true) {
  el.classList.remove("hidden", "bad");
  if (!ok) el.classList.add("bad");
  el.innerHTML = message;
}

function validPhone(value) {
  return /^\d{8,15}$/.test(value);
}

$("pairBtn").addEventListener("click", async () => {
  const phone = $("phone").value.replace(/\D/g, "");
  const out = $("pairResult");

  if (!validPhone(phone)) {
    show(out, "⚠️ Enter a valid phone number with country code.", false);
    return;
  }

  if (!API || API.includes("YOUR-HASA-MD")) {
    show(out, "⚠️ Set BOT_API_URL in assets/config.js first.", false);
    return;
  }

  $("pairBtn").disabled = true;
  $("pairBtn").textContent = "PAIRING…";

  try {
    const res = await fetch(`${API}/pair`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({phone})
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Pairing failed");
    }

    show(out, `<span class="code">${data.code || "CODE SENT"}</span><br>
      Enter this code in WhatsApp → Linked devices → Link a device.`);
  } catch (e) {
    show(out, `❌ ${e.message}`, false);
  } finally {
    $("pairBtn").disabled = false;
    $("pairBtn").textContent = "PAIR";
  }
});

$("qrBtn").addEventListener("click", async () => {
  const out = $("qrResult");
  if (!API || API.includes("YOUR-HASA-MD")) {
    show(out, "⚠️ Set BOT_API_URL in assets/config.js first.", false);
    return;
  }

  $("qrBtn").disabled = true;
  $("qrBtn").textContent = "LOADING…";

  try {
    const res = await fetch(`${API}/qr`);
    const data = await res.json();
    if (!res.ok || !data.success || !data.qr) {
      throw new Error(data.message || "QR is not ready yet");
    }

    // The backend returns a QR payload. QR rendering is done by a trusted CDN library.
    const img = document.createElement("img");
    img.alt = "WhatsApp QR code";
    img.className = "qr-image";
    img.src = `https://quickchart.io/qr?text=${encodeURIComponent(data.qr)}&size=280`;
    $("qrBox").replaceChildren(img);
    show(out, "✅ QR loaded. Scan it from WhatsApp → Linked devices.");
  } catch (e) {
    show(out, `❌ ${e.message}`, false);
  } finally {
    $("qrBtn").disabled = false;
    $("qrBtn").textContent = "GENERATE QR";
  }
});

// Subtle pointer glow, without heavy animation on mobile.
document.addEventListener("pointermove", (e) => {
  document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
  document.documentElement.style.setProperty("--my", `${e.clientY}px`);
});

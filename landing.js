(function () {
  const cfg = window.STUDENT_PLUS_CONFIG || {};
  const THEME_KEY = "student_plus_theme";

  const ICONS = {
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    laptop: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    chat: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    book: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
  };

  // 1. Theme Initialization & Toggle
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggleBtn");
  function applyTheme(mode) {
    const isDark = mode === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    if (themeBtn) themeBtn.innerHTML = isDark ? ICONS.sun : ICONS.moon;
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  // Toast Notification Utility
  const toastEl = document.getElementById("landingToast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  // 2. Smart Device Detection Banner
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const banner = document.getElementById("deviceBanner");
  if (banner) {
    if (isIOS) {
      banner.innerHTML = `
        <div>
          <span class="pill pill-emerald">${ICONS.phone} <span>تم التعرّف على جهاز آيفون / آيباد</span></span>
          <strong style="margin-inline-start:8px;">يمكنك تشغيل Student Plus فوراً كتطبيق على شاشتك الرئيسية دون App Store.</strong>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="./app.html" class="btn btn-emerald btn-sm">افتح نسخة الآيفون الآن</a>
          <button type="button" id="bannerIosHelp" class="btn btn-glass btn-sm">خطوات سفاري</button>
        </div>
      `;
      document.getElementById("bannerIosHelp")?.addEventListener("click", () => openModal("iosModal"));
    } else if (isAndroid) {
      banner.innerHTML = `
        <div>
          <span class="pill">${ICONS.phone} <span>تم التعرّف على جهاز أندرويد</span></span>
          <strong style="margin-inline-start:8px;">التطبيق جاهز للتحميل المباشر بصيغة APK (${cfg.apkSizeLabel || "29 MB"}).</strong>
        </div>
        <button type="button" id="bannerApkDownload" class="btn btn-primary btn-sm">${ICONS.download} <span>تحميل Student Plus</span></button>
      `;
      document.getElementById("bannerApkDownload")?.addEventListener("click", triggerApkDownload);
    } else {
      banner.innerHTML = `
        <div>
          <span class="pill">${ICONS.laptop} <span>متاح لجميع الأنظمة</span></span>
          <span style="margin-inline-start:8px; color:var(--text-muted);">
            استخدم <strong>نسخة الويب والآيفون (PWA)</strong> من متصفحك مباشرة أو حمّل <strong>حزمة الأندرويد APK</strong> لهاتفك.
          </span>
        </div>
        <a href="./app.html" class="btn btn-glass btn-sm">تجربة التطبيق عبر الويب</a>
      `;
    }
  }

  // 3. Configure APK Links & Metadata
  const apkUrl = cfg.apkUrl || "./downloads/student-plus.apk";
  const directApkAnchor = document.getElementById("directApkAnchor");
  const modalDirectDownload = document.getElementById("modalDirectDownload");
  if (directApkAnchor) directApkAnchor.href = apkUrl;
  if (modalDirectDownload) modalDirectDownload.href = apkUrl;

  if (cfg.version) {
    const v = document.getElementById("apkVersionText");
    if (v) v.textContent = cfg.version;
  }
  if (cfg.apkSizeLabel) {
    const s = document.getElementById("apkSizeText");
    if (s) s.textContent = cfg.apkSizeLabel;
  }
  if (cfg.minAndroidLabel) {
    const m = document.getElementById("apkMinOsText");
    if (m) m.textContent = cfg.minAndroidLabel;
  }

  function triggerApkDownload() {
    const link = document.createElement("a");
    link.href = apkUrl;
    link.download = cfg.apkFileName || "StudentPlus.apk";
    document.body.appendChild(link);
    link.click();
    link.remove();
    openModal("apkModal");
    showToast("بدأ تحميل تطبيق Student Plus للأندرويد...");
  }

  document.getElementById("heroApkBtn")?.addEventListener("click", triggerApkDownload);
  document.getElementById("showApkStepsBtn")?.addEventListener("click", () => openModal("apkModal"));
  document.getElementById("openIosGuideBtn")?.addEventListener("click", () => openModal("iosModal"));

  document.getElementById("copyPwaUrlBtn")?.addEventListener("click", async () => {
    const pwaUrl = new URL("./app.html", window.location.href).href;
    try {
      await navigator.clipboard.writeText(pwaUrl);
      showToast("تم نسخ رابط نسخة الآيفون والويب بنجاح.");
    } catch {
      showToast("الرابط: " + pwaUrl);
    }
  });

  // 4. Interactive Live Student-Only Preview
  // const previewData = {
  //   dashboard: {
  //     badge: "لوحة الطالب التفاعلية",
  //     badgeClass: "pill",
  //     kpiTitle: "متابعة أنشطتي",
  //     kpiValue: "4 أنشطة • 2 مكتملة",
  //     cardTitle: "تصميم خوارزميات هياكل البيانات",
  //     cardMeta: "المختص: م. سارة الحربي • 120 ريال (معتمد)",
  //     statusLabel: "مرفوع الحل — بانتظار الإيصال",
  //     progress: 75,
  //     actions: [
  //       { icon: ICONS.chat, label: "فتح الدردشة ورفع الإيصال", msg: "في التطبيق الفعلي، تُفتح المحادثة الفورية لرفع الإيصال (3) واعتماد الإكمال." },
  //       { icon: ICONS.download, label: "حفظ نسخة من الحل", msg: "يتم حفظ نسخة محلية في جهازك (أندرويد أو تطبيق الملفات في آيفون)." }
  //     ]
  //   },
  //   chat: {
  //     badge: "المحادثة وتثبيت السعر",
  //     badgeClass: "pill pill-gold",
  //     kpiTitle: "حالة التفاوض",
  //     kpiValue: "موافقة مزدوجة قبل التنفيذ",
  //     // cardTitle: "تحليل نظم قواعد البيانات العلائقية",
  //     // cardMeta: "السعر المقترح: 150 ريال • بانتظار موافقتك",
  //     statusLabel: "تأكيد السعر المزدوج",
  //     progress: 50,
  //     actions: [
  //       { icon: ICONS.check, label: "موافقة واعتماد السعر", msg: "عند موافقة الطالب يُثبّت السعر نهائياً وتبدأ مرحلة تجهيز الحل." },
  //       { icon: ICONS.chat, label: "إرسال ملاحظة إضافية", msg: "يمكنك إرسال أي توضيح إضافي داخل المحادثة المباشرة في أي وقت." }
  //     ]
  //   },
  //   // helpers: {
  //   //   badge: "دليل المختصين وخصوصية الطالب",
  //   //   badgeClass: "pill pill-emerald",
  //   //   // kpiTitle: "المختصون المعتمدون",
  //   //   // kpiValue: "خصوصية تامة لأنشطتك",
  //   //   // cardTitle: "م. سارة الحربي — علوم الحاسب والرياضيات",
  //   //   // cardMeta: "متخصصة في الخوارزميات وهياكل البيانات • تقييم 4.9 من 5",
  //   //   // statusLabel: "مختص معتمد",
  //   //   progress: 100,
  //   //   actions: [
  //   //     { icon: ICONS.check, label: "ترشيح لطلب نشاط جديد", msg: "يمكنك ترشيح أي مختص من الدليل مباشرة عند نشر نشاطك الخاص." },
  //   //     { icon: ICONS.lock, label: "ضمان الخصوصية الفردية", msg: "أنشطتك وملفاتك خاصة بك ولا تظهر أبداً لأي طالب آخر." }
  //   //   ]
  //   // }
  // };

  const livePreviewBody = document.getElementById("livePreviewBody");
  function renderPreview(viewKey) {
    if (!livePreviewBody) return;
    const item = previewData[viewKey] || previewData.dashboard;
    livePreviewBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <span class="${item.badgeClass}">${item.badge}</span>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">${item.kpiTitle}: ${item.kpiValue}</span>
      </div>
      <div class="mock-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <strong style="font-size:0.98rem;">${item.cardTitle}</strong>
          <span class="pill" style="font-size:0.72rem;">${item.statusLabel}</span>
        </div>
        <div style="color:var(--text-muted); font-size:0.82rem; margin-top:4px;">${item.cardMeta}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${item.progress}%"></div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
          ${item.actions.map((a, idx) => `<button type="button" class="btn btn-glass btn-sm preview-demo-action" data-idx="${idx}">${a.icon} <span>${a.label}</span></button>`).join("")}
        </div>
      </div>
      <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-muted);">
        <span style="display:inline-flex; align-items:center; gap:5px;">${ICONS.lock} <span>3 مرفقات محمية</span></span>
        <a href="./app.html" style="color:var(--primary); font-weight:700; text-decoration:none;">جرّب النسخة الحية ←</a>
      </div>
    `;
    livePreviewBody.querySelectorAll(".preview-demo-action").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-idx"));
        showToast(item.actions[idx]?.msg || "");
      });
    });
  }

  document.querySelectorAll(".role-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".role-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderPreview(tab.getAttribute("data-preview-view"));
    });
  });
  renderPreview("dashboard");

  // 5. FAQ Accordion
  document.querySelectorAll(".faq-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      trigger.closest(".faq-item")?.classList.toggle("open");
    });
  });

  // 6. Modals
  function openModal(id) {
    document.getElementById(id)?.classList.add("open");
  }
  function closeModal(id) {
    document.getElementById(id)?.classList.remove("open");
  }
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close-modal")));
  });
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("open");
    });
  });

  // 7. Register Service Worker for offline shell + iOS/PWA readiness
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();

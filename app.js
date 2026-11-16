import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const cfg = window.STUDENT_PLUS_CONFIG || {};
const THEME_KEY = "student_plus_theme";
const ADMIN_PIN_KEY = "student_plus_admin_pin";
const GUIDE_SEEN_KEY = "student_plus_pwa_guide_seen";
const IOS_BANNER_DISMISSED_KEY = "student_plus_ios_banner_dismissed";
const MAX_BASE64_LEN = 440000;

const SVG_ICONS = {
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  shield: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  lock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  key: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
  notice: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  ban: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  library: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  market: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  wallet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  attach: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  transfer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  award: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
};

// Theme setup
const rootEl = document.documentElement;
const themeBtn = document.getElementById("pwaThemeBtn");
function applyTheme(mode) {
  const dark = mode === "dark";
  rootEl.setAttribute("data-theme", dark ? "dark" : "light");
  if (themeBtn) themeBtn.innerHTML = dark ? SVG_ICONS.sun : SVG_ICONS.moon;
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}
applyTheme(localStorage.getItem(THEME_KEY) || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn?.addEventListener("click", () => applyTheme(rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark"));

// Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

// iOS Safari install prompt banner
const ua = navigator.userAgent || "";
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
const iosBanner = document.getElementById("iosInstallBanner");
if (isIOS && !isStandalone && !localStorage.getItem(IOS_BANNER_DISMISSED_KEY) && iosBanner) {
  iosBanner.style.display = "flex";
}
document.getElementById("dismissIosBannerBtn")?.addEventListener("click", () => {
  localStorage.setItem(IOS_BANNER_DISMISSED_KEY, "1");
  if (iosBanner) iosBanner.style.display = "none";
});

// UI Helpers
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const toastEl = document.getElementById("pwaToast");
let toastTimer = null;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500);
}

const modalBackdrop = document.getElementById("pwaModal");
const modalPanel = document.getElementById("pwaModalPanel");
function openModal(html) {
  if (!modalPanel || !modalBackdrop) return;
  modalPanel.innerHTML = html;
  modalBackdrop.classList.add("open");
}
function closeModal() {
  modalBackdrop?.classList.remove("open");
}
modalBackdrop?.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

function formatTs(ts) {
  if (!ts) return "الآن";
  try {
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "الآن";
  }
}

function statusMeta(act) {
  if (act.status === "cancelled") return { label: "ملغى إدارياً", cls: "pill pill-danger", progress: 0 };
  if (act.isFrozen) return { label: "مجمّد مؤقتاً", cls: "pill", progress: 40 };
  switch (act.status) {
    case "open": return { label: "مفتوح للاستلام", cls: "pill", progress: 20 };
    case "claimed": return { label: "قيد التفاوض", cls: "pill pill-gold", progress: 45 };
    case "price_agreed": return { label: "سعر معتمد", cls: "pill", progress: 65 };
    case "answer_uploaded": return { label: "مرفوع الحل", cls: "pill pill-gold", progress: 85 };
    case "completed": return { label: "مكتمل وموثّق", cls: "pill pill-emerald", progress: 100 };
    default: return { label: act.status || "غير معروف", cls: "pill", progress: 20 };
  }
}

function readFileAsAttachedObject(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("لم يتم اختيار ملف"));
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (base64.length > MAX_BASE64_LEN) {
        reject(new Error("حجم الملف يتجاوز الحد المسموح للحفظ المباشر (~320 KB). يرجى ضغط الملف."));
        return;
      }
      resolve({
        name: (file.name || "file").slice(0, 250),
        mimeType: (file.type || "application/octet-stream").slice(0, 100),
        base64Data: base64
      });
    };
    reader.onerror = () => reject(new Error("تعذرت قراءة الملف من جهازك"));
    reader.readAsDataURL(file);
  });
}

function downloadBase64File(fileName, base64Data, mimeType) {
  if (!base64Data) {
    showToast("بيانات هذا الملف غير متوفرة للتحميل.");
    return;
  }
  try {
    const cleanMime = mimeType || "application/octet-stream";
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: cleanMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "student_plus_file";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast(`تم تجهيز تحميل نسخة: ${fileName}`);
  } catch {
    showToast("حدث خطأ أثناء تحضير الملف للتحميل.");
  }
}

function previewBase64File(fileName, base64Data, mimeType) {
  if (!base64Data) {
    showToast("لا توجد بيانات للمعاينة.");
    return;
  }
  const cleanMime = mimeType || "application/octet-stream";
  const dataUri = `data:${cleanMime};base64,${base64Data}`;
  let previewInner = `<p style="color:var(--text-muted);">المعاينة المباشرة متاحة للصور وملفات PDF. يمكنك حفظ نسخة على جهازك بالزر أدناه.</p>`;
  if (cleanMime.startsWith("image/")) {
    previewInner = `<img src="${dataUri}" alt="${escapeHtml(fileName)}" style="max-width:100%; max-height:60vh; border-radius:14px; display:block; margin:auto;" />`;
  } else if (cleanMime === "application/pdf") {
    previewInner = `<iframe src="${dataUri}" title="${escapeHtml(fileName)}" style="width:100%; height:60vh; border:none; border-radius:12px;"></iframe>`;
  }
  openModal(`
    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <h3 style="margin:0; font-size:1.05rem;">${escapeHtml(fileName)}</h3>
      <button type="button" class="icon-btn" id="closePreviewModal" aria-label="إغلاق">${SVG_ICONS.close}</button>
    </div>
    <div style="margin-bottom:14px;">${previewInner}</div>
    <div style="display:flex; justify-content:flex-end; gap:10px;">
      <button type="button" class="btn btn-primary" id="downloadFromPreviewBtn">${SVG_ICONS.download} <span>حفظ نسخة على جهازي</span></button>
    </div>
  `);
  document.getElementById("closePreviewModal")?.addEventListener("click", closeModal);
  document.getElementById("downloadFromPreviewBtn")?.addEventListener("click", () => downloadBase64File(fileName, base64Data, cleanMime));
}

// Initialize Firebase (supports Firebase Hosting auto-init with fallback to config.js)
async function loadFirebaseConfig() {
  try {
    const res = await fetch("/__/firebase/init.json");
    if (res.ok) {
      const hosted = await res.json();
      if (hosted && hosted.projectId) return hosted;
    }
  } catch {}
  return cfg.firebase;
}

const fbConfig = await loadFirebaseConfig();
const app = initializeApp(fbConfig);
const auth = getAuth(app);
const db = getFirestore(app, cfg.firestoreDatabaseId);

getRedirectResult(auth).catch((err) => {
  if (err?.message) showToast("تنبيه تسجيل الدخول: " + err.message);
});

// Application State
const state = {
  user: null,
  profile: null,
  profileLoaded: false,
  helpers: [],
  activities: [],
  reviews: [],
  adminUsers: [],
  adminHelperInvites: [],
  adminReviews: [],
  platformSettings: {
    minActivityPrice: 10,
    defaultDeadlineHours: 72,
    stalledThresholdHours: 24,
    maintenanceNotice: "",
    allowNewActivities: true
  },
  activeTab: "home",
  studentFilter: "all",
  adminSubTab: "activities",
  adminUnlocked: false,
  adminPinModalOpen: false,
  selectedActivityId: null,
  chatMessages: [],
  chatUnsub: null,
  activitiesUnsubs: [],
  unsubs: []
};

const pwaRoot = document.getElementById("pwaRoot");
const pwaBottomNav = document.getElementById("pwaBottomNav");
const pwaSignOutBtn = document.getElementById("pwaSignOutBtn");
const pwaGuideBtn = document.getElementById("pwaGuideBtn");
const headerUserMeta = document.getElementById("headerUserMeta");
const maintenanceBanner = document.getElementById("maintenanceBanner");
const suspendedBanner = document.getElementById("suspendedBanner");

function isUserAdmin() {
  const email = state.user?.email || "";
  return email.trim().toLowerCase() === String(cfg.adminEmail || "").toLowerCase();
}

function clearActivitiesSubscriptions() {
  state.activitiesUnsubs.forEach((u) => { try { u(); } catch {} });
  state.activitiesUnsubs = [];
}

function clearSubscriptions() {
  clearActivitiesSubscriptions();
  state.unsubs.forEach((u) => { try { u(); } catch {} });
  state.unsubs = [];
  if (state.chatUnsub) {
    try { state.chatUnsub(); } catch {}
    state.chatUnsub = null;
  }
}

function handleActivitiesSnapshotDocs(docs) {
  state.activities = docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  renderApp();
  if (state.selectedActivityId) {
    const refreshed = state.activities.find((x) => x.id === state.selectedActivityId);
    if (refreshed) renderActivityDetailModal(refreshed, true);
  }
}

function syncActivitiesSubscription(user) {
  clearActivitiesSubscriptions();
  if (!user || !state.profileLoaded || !state.profile) {
    state.activities = [];
    return;
  }
  const colRef = collection(db, "activities");
  if (state.adminUnlocked && isUserAdmin()) {
    const unsub = onSnapshot(query(colRef, where("isShared", "==", true)), (snap) => {
      handleActivitiesSnapshotDocs(snap.docs);
    });
    state.activitiesUnsubs.push(unsub);
    return;
  }
  if (state.profile.role === "helper") {
    let openDocs = [];
    let assignedDocs = [];
    const mergeHelperDocs = () => {
      const merged = new Map();
      openDocs.forEach((d) => merged.set(d.id, d));
      assignedDocs.forEach((d) => merged.set(d.id, d));
      handleActivitiesSnapshotDocs(Array.from(merged.values()));
    };
    const uOpen = onSnapshot(query(colRef, where("status", "==", "open")), (snap) => {
      openDocs = snap.docs;
      mergeHelperDocs();
    });
    const uAssigned = onSnapshot(query(colRef, where("assignedHelperId", "==", user.uid)), (snap) => {
      assignedDocs = snap.docs;
      mergeHelperDocs();
    });
    state.activitiesUnsubs.push(uOpen, uAssigned);
    return;
  }
  // Student: strictly own activities only
  const uStudent = onSnapshot(query(colRef, where("studentId", "==", user.uid)), (snap) => {
    handleActivitiesSnapshotDocs(snap.docs);
  });
  state.activitiesUnsubs.push(uStudent);
}

// Stealth Admin Logo Trigger (5 rapid taps OR 650ms long press)
let logoTapCount = 0;
let lastLogoTapMs = 0;
let longPressTimer = null;
const logoTrigger = document.getElementById("pwaLogoTrigger");
function handleStealthAdminTrigger() {
  if (!state.user || !isUserAdmin()) return;
  if (state.adminUnlocked) {
    state.activeTab = "admin";
    renderApp();
    showToast("تم التبديل إلى لوحة المدير");
    return;
  }
  openAdminPinDialog();
}
logoTrigger?.addEventListener("click", () => {
  const now = Date.now();
  logoTapCount = now - lastLogoTapMs > 2000 ? 1 : logoTapCount + 1;
  lastLogoTapMs = now;
  if (logoTapCount >= 5) {
    logoTapCount = 0;
    handleStealthAdminTrigger();
  }
});
logoTrigger?.addEventListener("pointerdown", () => {
  longPressTimer = setTimeout(() => {
    logoTapCount = 0;
    handleStealthAdminTrigger();
  }, 650);
});
["pointerup", "pointercancel", "pointerleave"].forEach((ev) => {
  logoTrigger?.addEventListener(ev, () => clearTimeout(longPressTimer));
});

function openAdminPinDialog() {
  const expectedPin = localStorage.getItem(ADMIN_PIN_KEY) || cfg.defaultAdminPin || "2468";
  openModal(`
    <h3 style="margin:0 0 8px; display:flex; align-items:center; gap:8px;">${SVG_ICONS.shield} <span>التحقق الأمني لبوابة المدير</span></h3>
    <p style="color:var(--text-muted); font-size:0.9rem; margin:0 0 14px;">
      تم التحقق من البريد المصرح (${escapeHtml(state.user?.email)}). أدخل رمز PIN للوصول للوحة الإدارة.
      <br/><small>الرمز الافتراضي أول مرة: <strong>2468</strong> ويمكن تغييره من الإعدادات.</small>
    </p>
    <label class="field-label" for="adminPinInput">الرمز السري (PIN)</label>
    <input id="adminPinInput" class="input" type="password" inputmode="numeric" maxlength="10" placeholder="أدخل الرمز السري" />
    <div id="adminPinError" style="color:var(--danger); font-size:0.84rem; margin-top:6px;"></div>
    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
      <button type="button" class="btn btn-glass" id="cancelAdminPinBtn">إلغاء</button>
      <button type="button" class="btn btn-primary" id="confirmAdminPinBtn">فتح لوحة المدير</button>
    </div>
  `);
  document.getElementById("cancelAdminPinBtn")?.addEventListener("click", closeModal);
  document.getElementById("confirmAdminPinBtn")?.addEventListener("click", () => {
    const val = document.getElementById("adminPinInput")?.value.trim() || "";
    if (val === expectedPin) {
      state.adminUnlocked = true;
      state.activeTab = "admin";
      syncActivitiesSubscription(state.user);
      subscribeAdminStreams();
      closeModal();
      renderApp();
      showToast("تم فتح بوابة المدير بنجاح");
    } else {
      const err = document.getElementById("adminPinError");
      if (err) err.textContent = "رمز PIN غير صحيح، حاول مرة أخرى.";
    }
  });
}

function subscribeAdminStreams() {
  if (!isUserAdmin()) return;
  const u1 = onSnapshot(collection(db, "users"), (snap) => {
    state.adminUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (state.activeTab === "admin") renderApp();
  });
  const u2 = onSnapshot(collection(db, "reviews"), (snap) => {
    state.adminReviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (state.activeTab === "admin") renderApp();
  });
  const u3 = onSnapshot(collection(db, "helper_invites"), (snap) => {
    state.adminHelperInvites = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    if (state.activeTab === "admin") renderApp();
  });
  state.unsubs.push(u1, u2, u3);
}

// Auth Listener
onAuthStateChanged(auth, (user) => {
  clearSubscriptions();
  state.user = user;
  state.profile = null;
  state.profileLoaded = false;
  state.adminUnlocked = false;
  state.selectedActivityId = null;

  if (!user) {
    if (pwaSignOutBtn) pwaSignOutBtn.style.display = "none";
    if (pwaGuideBtn) pwaGuideBtn.style.display = "none";
    if (pwaBottomNav) pwaBottomNav.style.display = "none";
    if (headerUserMeta) headerUserMeta.textContent = "نسخة الآيفون والويب التفاعلية";
    if (maintenanceBanner) maintenanceBanner.style.display = "none";
    if (suspendedBanner) suspendedBanner.style.display = "none";
    renderAuthScreen();
    return;
  }

  if (pwaSignOutBtn) pwaSignOutBtn.style.display = "inline-flex";
  if (pwaGuideBtn) pwaGuideBtn.style.display = "inline-flex";

  // 1) Observe user profile and align activities stream strictly to caller role
  const profileUnsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
    const prevRole = state.profile?.role || null;
    const prevHasProfile = !!state.profile;
    state.profile = snap.exists() ? { id: snap.id, ...snap.data() } : null;
    state.profileLoaded = true;
    const nextRole = state.profile?.role || null;
    const nextHasProfile = !!state.profile;
    if (prevHasProfile !== nextHasProfile || prevRole !== nextRole || state.activitiesUnsubs.length === 0) {
      syncActivitiesSubscription(user);
    }
    if (state.profile && !localStorage.getItem(`${GUIDE_SEEN_KEY}_${state.profile.role}`)) {
      localStorage.setItem(`${GUIDE_SEEN_KEY}_${state.profile.role}`, "1");
      openRoleGuideModal(state.profile.role);
    }
    renderApp();
  }, (err) => {
    state.profileLoaded = true;
    showToast("تعذر تحميل الملف الشخصي: " + err.message);
    renderApp();
  });

  // 2) Observe shared helpers directory
  const helpersUnsub = onSnapshot(
    query(collection(db, "helper_directory"), where("role", "==", "helper")),
    (snap) => {
      state.helpers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderApp();
    }
  );

  // 3) Observe public reviews
  const reviewsUnsub = onSnapshot(
    query(collection(db, "reviews"), where("isPublic", "==", true)),
    (snap) => {
      state.reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderApp();
    }
  );

  // 4) Observe platform settings
  const settingsUnsub = onSnapshot(doc(db, "platform_settings", "global"), (snap) => {
    if (snap.exists()) {
      state.platformSettings = { ...state.platformSettings, ...snap.data() };
      renderApp();
    }
  });

  state.unsubs.push(profileUnsub, helpersUnsub, reviewsUnsub, settingsUnsub);
});

pwaSignOutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  showToast("تم تسجيل الخروج بنجاح");
});

pwaGuideBtn?.addEventListener("click", () => {
  const role = state.activeTab === "admin" && state.adminUnlocked ? "admin" : (state.profile?.role || "student");
  openRoleGuideModal(role);
});

function openRoleGuideModal(role) {
  const guides = {
    student: {
      title: "دليل الطالب في Student Plus",
      steps: [
        ["1. طرح نشاط جديد", "أدخل العنوان والوصف وملف النشاط (1)، ويمكنك ترشيح مساعد معيّن من الدليل."],
        ["2. التفاوض وتثبيت السعر", "عند استلام المساعد للنشاط، اتفقا على السعر داخل المحادثة واعتمداه من الطرفين."],
        ["3. استلام الحل وإيصال الحوالة", "بعد رفع المساعد لملف الحل (2)، ارفع إيصال الحوالة (3) لتوثيق النشاط وتقييم المساعد."]
      ]
    },
    helper: {
      title: "دليل المساعد في Student Plus",
      steps: [
        ["1. استلام الأنشطة", "تصفح «سوق الأنشطة» واستلم النشاط حصرياً، مع تمييز الطلبات المرشّحة لك."],
        ["2. الاتفاق ورفع الحل", "تفاوض مع الطالب على السعر ووافِقا عليه، ثم ارفع ملف الإجابة (2) أو حوّل النشاط قبل التسليم."],
        ["3. متابعة الأرباح", "تُحتسب الأرباح المثبتة والمكتملة وترتيبك تلقائياً في تبويب «الأرباح والترتيب»."]
      ]
    },
    admin: {
      title: "دليل المدير في Student Plus",
      steps: [
        ["1. بوابة سرية محمية", "يتم الدخول بالنقر 5 مرات أو الضغط المطوّل على الشعار العلوي مع البريد المصرح ورمز PIN."],
        ["2. إضافة المساعدين وإدارة المستخدمين", "إضافة المساعدين بالبريد أو ترقية الطلاب، وتعديل أو تجميد الحسابات المخالفة."],
        ["3. الأنشطة والتقييمات والإعدادات", "تجميد أو إلغاء أو تحويل أي نشاط غير مكتمل، ومراجعة وحذف التقييمات وضبط الإعدادات."]
      ]
    }
  };
  const g = guides[role] || guides.student;
  openModal(`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">${g.title}</h3>
      <button type="button" class="icon-btn" id="closeGuideModal" aria-label="إغلاق">${SVG_ICONS.close}</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
      ${g.steps.map(([t, d]) => `
        <div class="ios-step">
          <div>
            <strong>${t}</strong>
            <div style="color:var(--text-muted); font-size:0.88rem;">${d}</div>
          </div>
        </div>
      `).join("")}
    </div>
    <div style="display:flex; justify-content:flex-end;">
      <button type="button" class="btn btn-primary" id="doneGuideModal">ابدأ الآن</button>
    </div>
  `);
  document.getElementById("closeGuideModal")?.addEventListener("click", closeModal);
  document.getElementById("doneGuideModal")?.addEventListener("click", closeModal);
}

// Render Auth Screen
function renderAuthScreen() {
  if (!pwaRoot) return;
  pwaRoot.innerHTML = `
    <div class="glass-card-elevated" style="max-width:520px; margin:24px auto; padding:28px; text-align:center;">
      <div class="brand-logo-box" style="width:94px; height:94px; margin:0 auto 16px; border-radius:22px;">
        <img src="./assets/images/student-plus-logo.png" alt="شعار Student Plus" style="width:82px; height:82px;" />
      </div>
      <h1 style="margin:0 0 8px; color:var(--primary); font-size:1.75rem;">Student Plus</h1>
      <p style="margin:0 0 22px; color:var(--text-muted);">
        تطبيق الويب المتكامل لأجهزة آيفون والمتصفحات — متزامن لحظياً مع تطبيق الأندرويد.
      </p>
      <div class="glass-card" style="padding:16px; text-align:right; margin-bottom:22px; background:var(--glass-subtle);">
        <div style="font-weight:700; margin-bottom:6px; display:flex; align-items:center; gap:6px;">${SVG_ICONS.lock} <span>دخول آمن بنفس حساب Google</span></div>
        <div style="font-size:0.88rem; color:var(--text-muted);">
          جميع أنشطتك وملفاتك ومحادثاتك محفوظة وموثّقة سحابياً ومتاحة على أندرويد وآيفون في آن واحد.
        </div>
      </div>
      <button id="googleSignInBtn" type="button" class="btn btn-primary" style="width:100%;">
        ${SVG_ICONS.key}
        <span>تسجيل الدخول عبر Google</span>
      </button>
      <div id="authErrorBox" style="color:var(--danger); font-size:0.86rem; margin-top:12px;"></div>
    </div>
  `;

  document.getElementById("googleSignInBtn")?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const errBox = document.getElementById("authErrorBox");
    if (errBox) errBox.textContent = "";
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment" || isStandalone) {
        await signInWithRedirect(auth, provider);
      } else if (code !== "auth/popup-closed-by-user") {
        if (errBox) errBox.textContent = "تعذر تسجيل الدخول: " + (err?.message || code);
      }
    }
  });
}

// Render Student Onboarding Activation (Helper role is provisioned strictly by Admin)
function renderRoleSelection() {
  if (!pwaRoot) return;
  pwaRoot.innerHTML = `
    <div class="glass-card-elevated" style="max-width:560px; margin:20px auto; padding:26px;">
      <span class="pill">خطوة تفعيل سريعة لمرة واحدة</span>
      <h2 style="margin:10px 0 6px;">مرحباً بك في Student Plus</h2>
      <p style="color:var(--text-muted); margin:0 0 18px; font-size:0.92rem;">
        تم تسجيل دخولك عبر Google (${escapeHtml(state.user?.email || "")}).
        يبدأ الحساب تلقائياً بصلاحيات الطالب لمتابعة أنشطتك الدراسية وحلولك الموثقة بكل سهولة.
      </p>

      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
        <div class="ios-step">
          <span class="step-badge">1</span>
          <div>
            <strong>طرح الأنشطة وإرفاق الملفات</strong>
            <div style="color:var(--text-muted); font-size:0.86rem;">أرفق ملف النشاط وحدد مهلة التسليم وتابع تقدم المراحل خطوة بخطوة.</div>
          </div>
        </div>
        <div class="ios-step">
          <span class="step-badge">2</span>
          <div>
            <strong>محادثة خاصة واتفاق السعر المزدوج</strong>
            <div style="color:var(--text-muted); font-size:0.86rem;">تفاوض داخل الدردشة ولا يُعتمد المبلغ أو الإكمال إلا بموافقتك الموثقة.</div>
          </div>
        </div>
        <div class="ios-step">
          <span class="step-badge">3</span>
          <div>
            <strong>استلام الحل وحفظه بأمان</strong>
            <div style="color:var(--text-muted); font-size:0.86rem;">عاين حلولك الخاصة واحفظ نسخاً على جهازك مع مزامنة فورية بين الآيفون والأندرويد.</div>
          </div>
        </div>
      </div>

      <button id="confirmRoleBtn" type="button" class="btn btn-primary" style="width:100%;">تفعيل الحساب والبدء</button>
    </div>
  `;

  document.getElementById("confirmRoleBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("confirmRoleBtn");
    if (btn) btn.disabled = true;
    try {
      const uid = state.user.uid;
      const baseName = (state.user.displayName || "طالب").trim().slice(0, 100) || "طالب";
      const email = (state.user.email || "").trim().slice(0, 150);
      const emailLower = email.toLowerCase();

      // Check if Admin pre-invited this verified email as a Helper
      let invite = null;
      if (emailLower && state.user.emailVerified) {
        try {
          const invSnap = await getDoc(doc(db, "helper_invites", emailLower));
          if (invSnap.exists()) invite = invSnap.data();
        } catch {}
      }

      const assignedRole = invite ? "helper" : "student";
      const finalName = ((invite?.displayName || "").trim() || baseName).slice(0, 100);
      const finalSpecialty = (invite?.specialty || "").trim().slice(0, 120);

      const batch = writeBatch(db);
      const userPayload = {
        userId: uid,
        displayName: finalName,
        role: assignedRole,
        isSuspended: false,
        suspensionReason: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      if (email) userPayload.email = email;
      if (assignedRole === "helper" && finalSpecialty) userPayload.specialty = finalSpecialty;
      batch.set(doc(db, "users", uid), userPayload);

      if (assignedRole === "helper") {
        const helperPayload = {
          userId: uid,
          displayName: finalName,
          role: "helper",
          createdAt: serverTimestamp()
        };
        if (finalSpecialty) helperPayload.specialty = finalSpecialty;
        batch.set(doc(db, "helper_directory", uid), helperPayload);
        batch.delete(doc(db, "helper_invites", emailLower));
      }
      await batch.commit();
      showToast("تم تفعيل حسابك بنجاح، أهلاً بك في Student Plus!");
    } catch (err) {
      showToast("تعذر تفعيل الحساب: " + err.message);
      if (btn) btn.disabled = false;
    }
  });
}

// Compute Helper Stats dynamically from activities & reviews
function computeHelperStatsMap() {
  const map = {};
  for (const h of state.helpers) {
    map[h.userId] = {
      helperId: h.userId,
      helperName: h.displayName,
      specialty: h.specialty || "",
      lockedEarnings: 0,
      completedPaidEarnings: 0,
      pendingReceiptEarnings: 0,
      totalActivitiesCount: 0,
      completedCount: 0,
      averageRating: 0,
      reviewCount: 0
    };
  }
  for (const act of state.activities) {
    const hid = act.assignedHelperId;
    if (!hid) continue;
    if (!map[hid]) {
      map[hid] = {
        helperId: hid,
        helperName: act.assignedHelperName || "مساعد",
        specialty: "",
        lockedEarnings: 0,
        completedPaidEarnings: 0,
        pendingReceiptEarnings: 0,
        totalActivitiesCount: 0,
        completedCount: 0,
        averageRating: 0,
        reviewCount: 0
      };
    }
    const s = map[hid];
    s.totalActivitiesCount += 1;
    const price = Number(act.agreedPrice || 0);
    if (act.priceLocked && price > 0) {
      s.lockedEarnings += price;
      if (act.status === "completed") {
        s.completedPaidEarnings += price;
        s.completedCount += 1;
      } else {
        s.pendingReceiptEarnings += price;
      }
    } else if (act.status === "completed") {
      s.completedCount += 1;
    }
  }
  const ratingSums = {};
  for (const r of state.reviews) {
    if (!r.helperId) continue;
    if (!ratingSums[r.helperId]) ratingSums[r.helperId] = { sum: 0, count: 0 };
    ratingSums[r.helperId].sum += Number(r.rating || 0);
    ratingSums[r.helperId].count += 1;
  }
  for (const [hid, val] of Object.entries(ratingSums)) {
    if (map[hid] && val.count > 0) {
      map[hid].reviewCount = val.count;
      map[hid].averageRating = val.sum / val.count;
    }
  }
  return map;
}

// Main App Renderer
function renderApp() {
  if (!state.user) return;
  if (!state.profileLoaded) {
    pwaRoot.innerHTML = `<div class="glass-card-elevated" style="padding:32px; text-align:center;">جارٍ تحميل بيانات حسابك...</div>`;
    return;
  }
  if (!state.profile) {
    if (pwaBottomNav) pwaBottomNav.style.display = "none";
    renderRoleSelection();
    return;
  }

  const profile = state.profile;
  const roleLabel = state.activeTab === "admin" && state.adminUnlocked
    ? "وضع المدير"
    : (profile.role === "helper" ? "مساعد" : "طالب");
  if (headerUserMeta) {
    headerUserMeta.textContent = `${profile.displayName} • ${roleLabel}`;
  }

  // Maintenance & Suspension banners
  const notice = (state.platformSettings.maintenanceNotice || "").trim();
  if (maintenanceBanner) {
    if (notice) {
      maintenanceBanner.style.display = "flex";
      maintenanceBanner.innerHTML = `<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;"><span class="pill pill-gold">${SVG_ICONS.notice} <span>تنويه المنصة</span></span> <span>${escapeHtml(notice)}</span></div>`;
    } else {
      maintenanceBanner.style.display = "none";
    }
  }
  if (suspendedBanner) {
    if (profile.isSuspended) {
      suspendedBanner.style.display = "flex";
      suspendedBanner.innerHTML = `<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;"><span class="pill pill-danger">${SVG_ICONS.ban} <span>الحساب مجمّد</span></span> <span>${escapeHtml(profile.suspensionReason || "يرجى التواصل مع الإدارة.")}</span></div>`;
    } else {
      suspendedBanner.style.display = "none";
    }
  }

  // Configure Bottom Navigation
  const tabs = profile.role === "student"
    ? [
        { id: "home", icon: SVG_ICONS.list, label: "لوحتي" },
        { id: "directory", icon: SVG_ICONS.users, label: "دليل المساعدين" }
      ]
    : [
        { id: "home", icon: SVG_ICONS.market, label: "سوق الأنشطة" },
        { id: "mywork", icon: SVG_ICONS.chat, label: "محادثاتي ومهامي" },
        { id: "earnings", icon: SVG_ICONS.wallet, label: "الأرباح والترتيب" }
      ];
  if (state.adminUnlocked && isUserAdmin()) {
    tabs.push({ id: "admin", icon: SVG_ICONS.shield, label: "المدير" });
  }
  if (!tabs.some((t) => t.id === state.activeTab)) {
    state.activeTab = tabs[0].id;
  }

  if (pwaBottomNav) {
    pwaBottomNav.style.display = "flex";
    pwaBottomNav.innerHTML = tabs.map((t) => `
      <button type="button" class="pwa-nav-item ${state.activeTab === t.id ? "active" : ""}" data-tab="${t.id}">
        <span style="display:inline-flex; align-items:center; justify-content:center;">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `).join("");
    pwaBottomNav.querySelectorAll(".pwa-nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeTab = btn.getAttribute("data-tab");
        renderApp();
      });
    });
  }

  // Render active tab view
  if (state.activeTab === "admin" && state.adminUnlocked && isUserAdmin()) {
    renderAdminDashboard();
  } else if (profile.role === "student") {
    if (state.activeTab === "directory") renderStudentDirectory();
    else renderStudentHome();
  } else {
    if (state.activeTab === "mywork") renderHelperMyWork();
    else if (state.activeTab === "earnings") renderHelperEarnings();
    else renderHelperMarket();
  }
}

function renderActivityCardHtml(act) {
  const meta = statusMeta(act);
  const priceText = act.priceLocked
    ? `${act.agreedPrice} ريال (معتمد)`
    : (act.proposedPrice > 0 ? `مقترح: ${act.proposedPrice} ريال` : "السعر بالتفاوض");
  const partnerText = act.studentId === state.user.uid
    ? (act.assignedHelperName ? `المساعد: ${act.assignedHelperName}` : (act.preferredHelperName ? `مرشّح: ${act.preferredHelperName}` : "مفتوح للجميع"))
    : `الطالب: ${act.studentName}`;

  return `
    <article class="glass-card" style="padding:15px; cursor:pointer;" data-activity-id="${escapeHtml(act.id)}">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
        <span class="${meta.cls}">${meta.label}</span>
        <span style="font-size:0.84rem; font-weight:800; color:var(--emerald);">${escapeHtml(priceText)}</span>
      </div>
      <h3 style="margin:0 0 4px; font-size:1.04rem;">${escapeHtml(act.title)}</h3>
      <div style="font-size:0.84rem; color:var(--text-muted); margin-bottom:8px;">
        ${escapeHtml(partnerText)} • ${formatTs(act.createdAt)}
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${meta.progress}%"></div></div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:8px; font-size:0.82rem; color:var(--text-muted);">
        <span style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.attach} <span>${[act.activityFileName, act.answerFileName, act.receiptFileName].filter(Boolean).length} / 3 مرفقات</span></span>
        <span style="color:var(--primary); font-weight:700;">عرض التفاصيل والدردشة</span>
      </div>
    </article>
  `;
}

function attachActivityCardListeners(container) {
  container.querySelectorAll("[data-activity-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-activity-id");
      const act = state.activities.find((a) => a.id === id);
      if (act) renderActivityDetailModal(act, false);
    });
  });
}

// STUDENT HOME
function renderStudentHome() {
  const mine = state.activities.filter((a) => a.studentId === state.user.uid);
  const completedCount = mine.filter((a) => a.status === "completed").length;
  const activeCount = mine.filter((a) => a.status !== "completed" && a.status !== "cancelled").length;
  const filtered = mine.filter((a) => {
    if (state.studentFilter === "active") return a.status !== "completed" && a.status !== "cancelled";
    if (state.studentFilter === "completed") return a.status === "completed";
    return true;
  });

  pwaRoot.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="glass-card-elevated" style="padding:18px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <h2 style="margin:0 0 4px; font-size:1.3rem;">لوحة متابعة الطالب</h2>
          <div style="color:var(--text-muted); font-size:0.9rem;">الأنشطة النشطة: <strong>${activeCount}</strong> • المكتملة: <strong>${completedCount}</strong></div>
        </div>
        <button id="openCreateActivityBtn" type="button" class="btn btn-primary">+ طرح نشاط جديد</button>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm ${state.studentFilter === "all" ? "btn-primary" : "btn-glass"}" data-sfilter="all">الكل (${mine.length})</button>
        <button type="button" class="btn btn-sm ${state.studentFilter === "active" ? "btn-primary" : "btn-glass"}" data-sfilter="active">النشطة (${activeCount})</button>
        <button type="button" class="btn btn-sm ${state.studentFilter === "completed" ? "btn-primary" : "btn-glass"}" data-sfilter="completed">المكتملة (${completedCount})</button>
      </div>

      <div id="studentActivitiesList" style="display:flex; flex-direction:column; gap:12px;">
        ${filtered.length ? filtered.map(renderActivityCardHtml).join("") : `
          <div class="glass-card" style="padding:28px; text-align:center; color:var(--text-muted);">
            لا توجد أنشطة في هذا التصنيف حالياً. اضغط «+ طرح نشاط جديد» للبدء!
          </div>
        `}
      </div>
    </div>
  `;

  pwaRoot.querySelectorAll("[data-sfilter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.studentFilter = btn.getAttribute("data-sfilter");
      renderStudentHome();
    });
  });
  document.getElementById("openCreateActivityBtn")?.addEventListener("click", () => openCreateActivityModal());
  attachActivityCardListeners(pwaRoot);
}

// STUDENT HELPERS DIRECTORY (Private per-student isolation — no cross-student activity library)
function renderStudentDirectory() {
  const statsMap = computeHelperStatsMap();
  const helpersList = Object.values(statsMap).filter((h) => h.helperId !== state.user.uid);

  pwaRoot.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="glass-card-elevated" style="padding:18px;">
        <h2 style="margin:0 0 4px; font-size:1.25rem; display:flex; align-items:center; gap:8px;">${SVG_ICONS.users} <span>دليل المساعدين المعتمدين</span></h2>
        <div style="color:var(--text-muted); font-size:0.9rem;">اختر المساعد الأنسب لتخصصك ورشّحه مباشرة عند طرح نشاطك الخاص.</div>
      </div>
      <div class="grid-2">
        ${helpersList.length ? helpersList.map((h) => `
          <div class="glass-card" style="padding:16px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <div>
              <strong>${escapeHtml(h.helperName)}</strong>
              <div style="font-size:0.84rem; color:var(--text-muted); display:flex; align-items:center; gap:5px; flex-wrap:wrap; margin-top:2px;">
                <span>${escapeHtml(h.specialty || "مساعد أنشطة تعليمية عام")}</span>
                ${h.reviewCount > 0 ? `<span style="display:inline-flex; align-items:center; gap:3px; color:var(--gold); font-weight:700;">• ${SVG_ICONS.star} ${h.averageRating.toFixed(1)} (${h.reviewCount})</span>` : `<span class="pill" style="font-size:0.72rem;">جديد</span>`}
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" data-prefer-helper="${escapeHtml(h.helperId)}">طرح نشاط له</button>
          </div>
        `).join("") : `<div class="glass-card" style="padding:20px; color:var(--text-muted);">لا يوجد مساعدون معتمدون بعد.</div>`}
      </div>
    </div>
  `;

  pwaRoot.querySelectorAll("[data-prefer-helper]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const hid = btn.getAttribute("data-prefer-helper");
      const helper = state.helpers.find((x) => x.userId === hid) || null;
      openCreateActivityModal(helper);
    });
  });
}

// Create Activity Modal (Student)
function openCreateActivityModal(preferredHelper = null) {
  if (state.profile?.isSuspended) {
    showToast("الحساب مجمّد ولا يمكنه طرح أنشطة جديدة.");
    return;
  }
  if (state.platformSettings.allowNewActivities === false) {
    showToast("طرح الأنشطة متوقف مؤقتاً من الإدارة.");
    return;
  }
  const helperOpts = state.helpers
    .filter((h) => h.userId !== state.user.uid)
    .map((h) => `<option value="${escapeHtml(h.userId)}" ${preferredHelper?.userId === h.userId ? "selected" : ""}>${escapeHtml(h.displayName)}${h.specialty ? " (" + escapeHtml(h.specialty) + ")" : ""}</option>`)
    .join("");

  openModal(`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <h3 style="margin:0;">طرح نشاط جديد</h3>
      <button type="button" class="icon-btn" id="closeCreateActBtn" aria-label="إغلاق">${SVG_ICONS.close}</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <label class="field-label" for="newActTitle">عنوان النشاط *</label>
        <input id="newActTitle" class="input" maxlength="200" placeholder="مثال: حل واجب قواعد البيانات" />
      </div>
      <div>
        <label class="field-label" for="newActDesc">تفاصيل وملاحظات النشاط</label>
        <textarea id="newActDesc" class="textarea" maxlength="2000" placeholder="اكتب المتطلبات بوضوح..."></textarea>
      </div>
      <div class="grid-2">
        <div>
          <label class="field-label" for="newActHelper">ترشيح مساعد (اختياري)</label>
          <select id="newActHelper" class="select">
            <option value="">مفتوح لجميع المساعدين</option>
            ${helperOpts}
          </select>
        </div>
        <div>
          <label class="field-label" for="newActDeadline">مهلة التسليم (بالساعات)</label>
          <input id="newActDeadline" class="input" type="number" min="1" max="720" value="${Number(state.platformSettings.defaultDeadlineHours || 72)}" />
        </div>
      </div>
      <div>
        <label class="field-label" for="newActFile">ملف النشاط (1) الإلزامي *</label>
        <input id="newActFile" class="input" type="file" />
        <small style="color:var(--text-muted);">الحد الأقصى المباشر للملف ~320 كيلوبايت (PDF أو صورة أو مستند).</small>
      </div>
      <div id="createActErr" style="color:var(--danger); font-size:0.86rem;"></div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" class="btn btn-glass" id="cancelCreateActBtn">إلغاء</button>
        <button type="button" class="btn btn-primary" id="submitCreateActBtn">نشر النشاط</button>
      </div>
    </div>
  `);

  document.getElementById("closeCreateActBtn")?.addEventListener("click", closeModal);
  document.getElementById("cancelCreateActBtn")?.addEventListener("click", closeModal);
  document.getElementById("submitCreateActBtn")?.addEventListener("click", async () => {
    const title = (document.getElementById("newActTitle")?.value || "").trim();
    const desc = (document.getElementById("newActDesc")?.value || "").trim();
    const prefId = document.getElementById("newActHelper")?.value || "";
    const hours = Math.max(1, Math.min(720, Number(document.getElementById("newActDeadline")?.value || 72)));
    const fileInput = document.getElementById("newActFile");
    const errEl = document.getElementById("createActErr");
    if (errEl) errEl.textContent = "";

    if (!title) {
      if (errEl) errEl.textContent = "يرجى إدخال عنوان النشاط.";
      return;
    }
    const rawFile = fileInput?.files?.[0];
    if (!rawFile) {
      if (errEl) errEl.textContent = "يرجى إرفاق ملف النشاط (1).";
      return;
    }

    const submitBtn = document.getElementById("submitCreateActBtn");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const attached = await readFileAsAttachedObject(rawFile);
      const prefHelper = state.helpers.find((h) => h.userId === prefId);
      const deadlineDate = new Date(Date.now() + hours * 3600 * 1000);
      const studentName = (state.profile.displayName || state.user.displayName || "طالب").slice(0, 100);
      const payload = {
        studentId: state.user.uid,
        studentName,
        assignedHelperId: "",
        assignedHelperName: "",
        title: title.slice(0, 200),
        status: "open",
        proposedPrice: 0,
        proposedByUid: "",
        studentApproved: false,
        helperApproved: false,
        priceLocked: false,
        agreedPrice: 0,
        activityFileName: attached.name,
        activityFileType: attached.mimeType,
        activityFileData: attached.base64Data,
        answerFileName: "",
        receiptFileName: "",
        transferCount: 0,
        deadlineAt: Timestamp.fromDate(deadlineDate),
        lastAlertText: prefHelper ? `نشاط جديد (مرشّح للمساعد: ${prefHelper.displayName})`.slice(0, 300) : "نشاط جديد بانتظار استلام أحد المساعدين",
        isShared: true,
        createdAt: serverTimestamp()
      };
      if (desc) payload.description = desc.slice(0, 2000);
      if (prefHelper) {
        payload.preferredHelperId = prefHelper.userId;
        payload.preferredHelperName = prefHelper.displayName.slice(0, 100);
      }
      await setDoc(doc(collection(db, "activities")), payload);
      closeModal();
      showToast("تم نشر النشاط بنجاح!");
    } catch (err) {
      if (errEl) errEl.textContent = err.message || "فشل نشر النشاط";
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// HELPER MARKET
function renderHelperMarket() {
  const openActs = state.activities.filter((a) => a.status === "open" && !a.isFrozen && a.studentId !== state.user.uid);
  pwaRoot.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="glass-card-elevated" style="padding:18px;">
        <h2 style="margin:0 0 4px; font-size:1.3rem; display:flex; align-items:center; gap:8px;">${SVG_ICONS.market} <span>سوق الأنشطة المفتوحة</span></h2>
        <div style="color:var(--text-muted); font-size:0.9rem;">الأنشطة المتاحة للاستلام الحصري الآن: <strong>${openActs.length}</strong></div>
      </div>

      ${openActs.length ? openActs.map((a) => {
        const isPref = a.preferredHelperId === state.user.uid;
        return `
          <div class="glass-card" style="padding:16px; ${isPref ? "border:1.5px solid var(--gold);" : ""}">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
              ${isPref ? `<span class="pill pill-gold">${SVG_ICONS.star} <span>مرشّح لك خصيصاً</span></span>` : `<span class="pill">مفتوح للاستلام</span>`}
              <span style="font-size:0.82rem; color:var(--text-muted);">${formatTs(a.createdAt)}</span>
            </div>
            <h3 style="margin:0 0 4px;">${escapeHtml(a.title)}</h3>
            <div style="font-size:0.86rem; color:var(--text-muted); margin-bottom:10px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span>الطالب: ${escapeHtml(a.studentName)}</span> • <span style="display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.attach} <span>${escapeHtml(a.activityFileName)}</span></span>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn btn-emerald btn-sm claim-act-btn" data-aid="${escapeHtml(a.id)}">${SVG_ICONS.check} <span>استلام النشاط</span></button>
              <button type="button" class="btn btn-glass btn-sm inspect-act-btn" data-aid="${escapeHtml(a.id)}">عرض التفاصيل</button>
            </div>
          </div>
        `;
      }).join("") : `
        <div class="glass-card" style="padding:28px; text-align:center; color:var(--text-muted);">
          لا توجد أنشطة مفتوحة في السوق حالياً.
        </div>
      `}
    </div>
  `;

  pwaRoot.querySelectorAll(".claim-act-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const aid = btn.getAttribute("data-aid");
      btn.disabled = true;
      try {
        await claimActivity(aid);
        showToast("تم استلام النشاط! تم فتح المحادثة.");
        state.activeTab = "mywork";
        renderApp();
      } catch (err) {
        showToast(err.message || "تعذر الاستلام");
        btn.disabled = false;
      }
    });
  });

  pwaRoot.querySelectorAll(".inspect-act-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = state.activities.find((a) => a.id === btn.getAttribute("data-aid"));
      if (act) renderActivityDetailModal(act, false);
    });
  });
}

async function claimActivity(activityId) {
  if (state.profile?.isSuspended) throw new Error("الحساب مجمّد من الإدارة.");
  const helperName = (state.profile?.displayName || state.user.displayName || "مساعد").slice(0, 100);
  const actRef = doc(db, "activities", activityId);
  const msgRef = doc(collection(actRef, "messages"));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(actRef);
    if (!snap.exists()) throw new Error("النشاط غير موجود");
    const d = snap.data();
    if (d.status !== "open" || d.assignedHelperId) throw new Error("تم استلام النشاط مسبقاً");
    if (d.studentId === state.user.uid) throw new Error("لا يمكنك استلام نشاط أنشأته بنفسك");
    tx.update(actRef, {
      assignedHelperId: state.user.uid,
      assignedHelperName: helperName,
      status: "claimed",
      lastAlertText: `استلم المساعد ${helperName} النشاط وبدأت المحادثة`.slice(0, 300),
      lastMessageAt: serverTimestamp()
    });
    tx.set(msgRef, {
      activityId,
      senderId: state.user.uid,
      senderName: helperName,
      senderRole: "helper",
      text: `تولّى المساعد ${helperName} حل النشاط. يمكنكم الآن الاتفاق على السعر والموافقة من الطرفين.`,
      messageType: "system_alert",
      participantUids: [d.studentId, state.user.uid],
      createdAt: serverTimestamp()
    });
  });
}

// HELPER MY WORK
function renderHelperMyWork() {
  const myWork = state.activities.filter((a) => a.assignedHelperId === state.user.uid);
  pwaRoot.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="glass-card-elevated" style="padding:18px;">
        <h2 style="margin:0 0 4px; font-size:1.3rem; display:flex; align-items:center; gap:8px;">${SVG_ICONS.chat} <span>محادثاتي ومهامي</span></h2>
        <div style="color:var(--text-muted); font-size:0.9rem;">الأنشطة المسندة إليك: <strong>${myWork.length}</strong></div>
      </div>
      ${myWork.length ? myWork.map(renderActivityCardHtml).join("") : `
        <div class="glass-card" style="padding:28px; text-align:center; color:var(--text-muted);">
          لم تستلم أي نشاط بعد. تصفح «سوق الأنشطة» للاستلام.
        </div>
      `}
    </div>
  `;
  attachActivityCardListeners(pwaRoot);
}

// HELPER EARNINGS & LEADERBOARD
function renderHelperEarnings() {
  const statsMap = computeHelperStatsMap();
  const me = statsMap[state.user.uid] || { lockedEarnings: 0, completedPaidEarnings: 0, pendingReceiptEarnings: 0, completedCount: 0, averageRating: 0, reviewCount: 0 };
  const board = Object.values(statsMap).sort((a, b) => b.lockedEarnings - a.lockedEarnings);

  pwaRoot.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="grid-3">
        <div class="glass-card-elevated" style="padding:18px;">
          <div style="color:var(--text-muted); font-size:0.85rem;">إجمالي الأرباح المثبتة</div>
          <div style="font-size:1.6rem; font-weight:800; color:var(--primary);">${me.lockedEarnings.toFixed(1)} ريال</div>
        </div>
        <div class="glass-card-elevated" style="padding:18px;">
          <div style="color:var(--text-muted); font-size:0.85rem;">أرباح مكتملة بإيصال</div>
          <div style="font-size:1.6rem; font-weight:800; color:var(--emerald);">${me.completedPaidEarnings.toFixed(1)} ريال</div>
        </div>
        <div class="glass-card-elevated" style="padding:18px;">
          <div style="color:var(--text-muted); font-size:0.85rem;">بانتظار الإيصال</div>
          <div style="font-size:1.6rem; font-weight:800; color:var(--gold);">${me.pendingReceiptEarnings.toFixed(1)} ريال</div>
        </div>
      </div>

      <div class="glass-card-elevated" style="padding:18px;">
        <h3 style="margin:0 0 12px; display:flex; align-items:center; gap:8px;">${SVG_ICONS.award} <span>ترتيب المساعدين</span></h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${board.map((h, i) => `
            <div class="glass-card" style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>#${i + 1} ${escapeHtml(h.helperName)}${h.helperId === state.user.uid ? " (أنت)" : ""}</strong>
                <div style="font-size:0.82rem; color:var(--text-muted); display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                  <span>${h.completedCount} مكتمل</span>
                  ${h.reviewCount > 0 ? `<span style="display:inline-flex; align-items:center; gap:3px; color:var(--gold); font-weight:700;">• ${SVG_ICONS.star} ${h.averageRating.toFixed(1)} (${h.reviewCount})</span>` : ""}
                </div>
              </div>
              <strong style="color:var(--emerald);">${h.lockedEarnings.toFixed(1)} ريال</strong>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// ACTIVITY DETAIL + CHAT + NEGOTIATION + FILES + RATING MODAL
function renderActivityDetailModal(act, isLiveRefresh) {
  state.selectedActivityId = act.id;
  const uid = state.user.uid;
  const isParticipant = uid === act.studentId || uid === act.assignedHelperId;
  const isAdminHere = state.adminUnlocked && isUserAdmin();

  if (!isLiveRefresh) {
    if (state.chatUnsub) { try { state.chatUnsub(); } catch {} }
    if (isParticipant || isAdminHere) {
      const msgCol = collection(db, "activities", act.id, "messages");
      const q = isAdminHere ? msgCol : query(msgCol, where("participantUids", "array-contains", uid));
      state.chatUnsub = onSnapshot(q, (snap) => {
        state.chatMessages = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.toMillis?.() || Number.MAX_SAFE_INTEGER) - (b.createdAt?.toMillis?.() || Number.MAX_SAFE_INTEGER));
        const box = document.getElementById("chatMessagesContainer");
        if (box) {
          box.innerHTML = renderChatMessagesHtml();
          box.scrollTop = box.scrollHeight;
        }
      });
    } else {
      state.chatMessages = [];
    }
  }

  const meta = statusMeta(act);
  const canNegotiate = (isParticipant) && act.status === "claimed" && !act.isFrozen && !state.profile?.isSuspended;
  const canApprovePrice = canNegotiate && act.proposedPrice > 0 && !act.priceLocked && act.proposedByUid && act.proposedByUid !== uid;
  const canUploadAnswer = uid === act.assignedHelperId && act.status === "price_agreed" && !act.isFrozen && !state.profile?.isSuspended;
  const canUploadReceipt = uid === act.studentId && act.status === "answer_uploaded" && !act.isFrozen && !state.profile?.isSuspended;
  const canTransfer = (uid === act.assignedHelperId || isAdminHere) && (act.status === "claimed" || act.status === "price_agreed") && !act.answerFileName;
  const existingReview = state.reviews.find((r) => r.activityId === act.id) || state.adminReviews.find((r) => r.activityId === act.id);
  const canRate = uid === act.studentId && act.status === "completed" && !existingReview && !state.profile?.isSuspended;

  openModal(`
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
      <div>
        <span class="${meta.cls}">${meta.label}</span>
        <h3 style="margin:6px 0 2px;">${escapeHtml(act.title)}</h3>
        <div style="font-size:0.84rem; color:var(--text-muted);">
          الطالب: ${escapeHtml(act.studentName)} • المساعد: ${escapeHtml(act.assignedHelperName || "لم يستلم بعد")}
        </div>
      </div>
      <button type="button" class="icon-btn" id="closeDetailModalBtn" aria-label="إغلاق">${SVG_ICONS.close}</button>
    </div>

    ${act.description ? `<p style="font-size:0.9rem; color:var(--text-muted); margin:0 0 12px;">${escapeHtml(act.description)}</p>` : ""}

    ${act.adminNote || act.frozenReason ? `
      <div class="glass-card" style="padding:10px 12px; margin-bottom:12px; border-right:4px solid var(--gold); font-size:0.86rem;">
        <strong>ملاحظة الإدارة:</strong> ${escapeHtml(act.frozenReason || act.adminNote)}
      </div>
    ` : ""}

    <!-- 3 Mandatory Files Section -->
    <div class="glass-card" style="padding:12px; margin-bottom:12px; background:var(--glass-subtle);">
      <strong style="font-size:0.92rem; display:flex; align-items:center; gap:6px;">${SVG_ICONS.attach} <span>المرفقات الثلاثة الموثّقة</span></strong>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
        ${renderFileRow("1) ملف النشاط", act.activityFileName, act.activityFileData, act.activityFileType, "f1")}
        ${renderFileRow("2) ملف إجابة النشاط", act.answerFileName, act.answerFileData, act.answerFileType, "f2")}
        ${renderFileRow("3) إيصال الحوالة", act.receiptFileName, act.receiptFileData, act.receiptFileType, "f3")}
      </div>
    </div>

    <!-- Price Status & Dual Approval -->
    <div class="glass-card" style="padding:12px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <strong style="display:flex; align-items:center; gap:6px;">${SVG_ICONS.wallet} <span>السعر: ${act.priceLocked ? `${act.agreedPrice} ريال (معتمد من الطرفين)` : (act.proposedPrice > 0 ? `عرض معلق ${act.proposedPrice} ريال` : "بانتظار الاتفاق")}</span></strong>
        ${canApprovePrice ? `<button type="button" id="approvePriceBtn" class="btn btn-emerald btn-sm">${SVG_ICONS.check} <span>موافقة واعتماد السعر</span></button>` : ""}
      </div>
      ${canNegotiate ? `
        <div style="display:flex; gap:8px; margin-top:10px;">
          <input id="proposePriceInput" class="input" type="number" min="1" placeholder="اقترح سعراً بالريال (الحد الأدنى ${Number(state.platformSettings.minActivityPrice || 10)})" />
          <button type="button" id="proposePriceBtn" class="btn btn-primary btn-sm" style="flex-shrink:0;">إرسال عرض</button>
        </div>
      ` : ""}
    </div>

    <!-- Step 4 Uploads -->
    ${canUploadAnswer ? `
      <div class="glass-card" style="padding:12px; margin-bottom:12px;">
        <label class="field-label" for="answerFileInput" style="display:flex; align-items:center; gap:6px;">${SVG_ICONS.upload} <span>رفع ملف الإجابة (2)</span></label>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input id="answerFileInput" class="input" type="file" style="flex:1;" />
          <button type="button" id="uploadAnswerBtn" class="btn btn-emerald btn-sm">اعتماد ورفع الإجابة</button>
        </div>
      </div>
    ` : ""}

    ${canUploadReceipt ? `
      <div class="glass-card" style="padding:12px; margin-bottom:12px;">
        <label class="field-label" for="receiptFileInput" style="display:flex; align-items:center; gap:6px;">${SVG_ICONS.upload} <span>رفع إيصال الحوالة (3) لإكمال النشاط</span></label>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input id="receiptFileInput" class="input" type="file" style="flex:1;" />
          <button type="button" id="uploadReceiptBtn" class="btn btn-primary btn-sm">رفع الإيصال وإكمال النشاط</button>
        </div>
      </div>
    ` : ""}

    ${canTransfer ? `
      <div class="glass-card" style="padding:12px; margin-bottom:12px;">
        <label class="field-label" for="transferTargetSelect" style="display:flex; align-items:center; gap:6px;">${SVG_ICONS.transfer} <span>تحويل النشاط لمساعد آخر</span></label>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <select id="transferTargetSelect" class="select" style="flex:1;">
            <option value="">اختر المساعد البديل...</option>
            ${state.helpers.filter((h) => h.userId !== act.assignedHelperId && h.userId !== act.studentId)
              .map((h) => `<option value="${escapeHtml(h.userId)}">${escapeHtml(h.displayName)}</option>`).join("")}
          </select>
          <button type="button" id="transferActBtn" class="btn btn-glass btn-sm">تنفيذ التحويل</button>
        </div>
      </div>
    ` : ""}

    ${canRate ? `
      <div class="glass-card" style="padding:12px; margin-bottom:12px;">
        <strong style="display:flex; align-items:center; gap:6px;">${SVG_ICONS.star} <span>تقييم المساعد</span></strong>
        <div style="display:flex; gap:8px; margin:8px 0; flex-wrap:wrap;">
          <select id="rateStarsSelect" class="select" style="max-width:170px;">
            <option value="5">5 من 5 (ممتاز)</option>
            <option value="4">4 من 5 (جيد جداً)</option>
            <option value="3">3 من 5 (جيد)</option>
            <option value="2">2 من 5 (مقبول)</option>
            <option value="1">1 من 5 (ضعيف)</option>
          </select>
          <input id="rateCommentInput" class="input" style="flex:1;" maxlength="500" placeholder="اكتب رأيك في الخدمة..." />
          <button type="button" id="submitRateBtn" class="btn btn-emerald btn-sm">إرسال التقييم</button>
        </div>
      </div>
    ` : (existingReview ? `<div class="pill pill-gold" style="margin-bottom:12px;">${SVG_ICONS.star} <span>تم التقييم: ${existingReview.rating}/5 ${existingReview.comment ? "— " + escapeHtml(existingReview.comment) : ""}</span></div>` : "")}

    <!-- Live Chat -->
    ${(isParticipant || isAdminHere) ? `
      <div class="glass-card" style="padding:12px;">
        <strong style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">${SVG_ICONS.chat} <span>المحادثة الفورية</span></strong>
        <div id="chatMessagesContainer" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding:6px;">
          ${renderChatMessagesHtml()}
        </div>
        ${(act.status !== "completed" && act.status !== "cancelled" && !act.isFrozen && !state.profile?.isSuspended) ? `
          <div style="display:flex; gap:8px; margin-top:10px;">
            <input id="chatMsgInput" class="input" maxlength="2000" placeholder="اكتب رسالتك هنا..." />
            <button type="button" id="sendChatBtn" class="btn btn-primary btn-sm">إرسال</button>
          </div>
        ` : ""}
      </div>
    ` : ""}
  `);

  document.getElementById("closeDetailModalBtn")?.addEventListener("click", () => {
    state.selectedActivityId = null;
    if (state.chatUnsub) { try { state.chatUnsub(); } catch {} state.chatUnsub = null; }
    closeModal();
  });

  // File Preview & Download handlers
  const fileMap = {
    f1: [act.activityFileName, act.activityFileData, act.activityFileType],
    f2: [act.answerFileName, act.answerFileData, act.answerFileType],
    f3: [act.receiptFileName, act.receiptFileData, act.receiptFileType]
  };
  modalPanel.querySelectorAll("[data-file-dl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [n, d, t] = fileMap[btn.getAttribute("data-file-dl")] || [];
      downloadBase64File(n, d, t);
    });
  });
  modalPanel.querySelectorAll("[data-file-pv]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [n, d, t] = fileMap[btn.getAttribute("data-file-pv")] || [];
      previewBase64File(n, d, t);
    });
  });

  const actorRole = isAdminHere ? "admin" : (uid === act.studentId ? "student" : "helper");
  const actorName = (state.profile?.displayName || state.user.displayName || "مستخدم").slice(0, 100);
  const participants = act.assignedHelperId ? [act.studentId, act.assignedHelperId] : [act.studentId];

  // Send message
  document.getElementById("sendChatBtn")?.addEventListener("click", async () => {
    const inp = document.getElementById("chatMsgInput");
    const txt = (inp?.value || "").trim();
    if (!txt) return;
    inp.value = "";
    try {
      const actRef = doc(db, "activities", act.id);
      const batch = writeBatch(db);
      batch.set(doc(collection(actRef, "messages")), {
        activityId: act.id,
        senderId: uid,
        senderName: actorName,
        senderRole: actorRole,
        text: txt.slice(0, 2000),
        messageType: "text",
        participantUids: participants,
        createdAt: serverTimestamp()
      });
      batch.update(actRef, {
        lastMessageText: txt.slice(0, 500),
        lastMessageAt: serverTimestamp(),
        lastAlertText: `رسالة جديدة من ${actorName}`.slice(0, 300)
      });
      await batch.commit();
    } catch (err) {
      showToast("تعذر إرسال الرسالة: " + err.message);
    }
  });

  // Propose Price
  document.getElementById("proposePriceBtn")?.addEventListener("click", async () => {
    const amount = Number(document.getElementById("proposePriceInput")?.value || 0);
    const minP = Number(state.platformSettings.minActivityPrice || 0);
    if (!amount || amount <= 0 || amount < minP) {
      showToast(`يرجى إدخال سعر لا يقل عن ${minP} ريال`);
      return;
    }
    try {
      const actRef = doc(db, "activities", act.id);
      const isStudent = uid === act.studentId;
      const summary = `تم اقتراح سعر للنشاط: ${amount} ريال (بانتظار موافقة الطرف الآخر)`;
      const batch = writeBatch(db);
      batch.update(actRef, {
        proposedPrice: amount,
        proposedByUid: uid,
        studentApproved: isStudent,
        helperApproved: !isStudent,
        lastMessageText: summary.slice(0, 500),
        lastMessageAt: serverTimestamp(),
        lastAlertText: `عرض سعر جديد (${amount} ريال) بانتظار الموافقة`.slice(0, 300)
      });
      batch.set(doc(collection(actRef, "messages")), {
        activityId: act.id,
        senderId: uid,
        senderName: actorName,
        senderRole: actorRole,
        text: summary,
        messageType: "price_proposal",
        proposedAmount: amount,
        participantUids: participants,
        createdAt: serverTimestamp()
      });
      await batch.commit();
      showToast("تم إرسال عرض السعر");
    } catch (err) {
      showToast("تعذر إرسال السعر: " + err.message);
    }
  });

  // Approve Price
  document.getElementById("approvePriceBtn")?.addEventListener("click", async () => {
    try {
      const actRef = doc(db, "activities", act.id);
      const msgRef = doc(collection(actRef, "messages"));
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(actRef);
        const d = snap.data();
        if (!d || d.status !== "claimed" || d.priceLocked || d.proposedByUid === uid) {
          throw new Error("لا يمكن اعتماد السعر حالياً");
        }
        const summary = `تمت الموافقة المزدوجة على السعر (${d.proposedPrice} ريال) وتثبيته في أرباح المساعد!`;
        tx.update(actRef, {
          studentApproved: true,
          helperApproved: true,
          priceLocked: true,
          agreedPrice: d.proposedPrice,
          status: "price_agreed",
          lastMessageText: summary.slice(0, 500),
          lastMessageAt: serverTimestamp(),
          lastAlertText: `تم اعتماد السعر (${d.proposedPrice} ريال) — بانتظار رفع ملف الإجابة`.slice(0, 300)
        });
        tx.set(msgRef, {
          activityId: act.id,
          senderId: uid,
          senderName: actorName,
          senderRole: actorRole,
          text: summary,
          messageType: "price_approved",
          proposedAmount: d.proposedPrice,
          participantUids: participants,
          createdAt: serverTimestamp()
        });
      });
      showToast("تمت الموافقة المزدوجة على السعر!");
    } catch (err) {
      showToast("تعذر الموافقة: " + err.message);
    }
  });

  // Upload Answer (File 2)
  document.getElementById("uploadAnswerBtn")?.addEventListener("click", async () => {
    const f = document.getElementById("answerFileInput")?.files?.[0];
    if (!f) { showToast("يرجى اختيار ملف الإجابة أولاً"); return; }
    try {
      const att = await readFileAsAttachedObject(f);
      const actRef = doc(db, "activities", act.id);
      const summary = `قام المساعد ${actorName} برفع ملف إجابة النشاط: ${att.name}`;
      const batch = writeBatch(db);
      batch.update(actRef, {
        answerFileName: att.name,
        answerFileType: att.mimeType,
        answerFileData: att.base64Data,
        status: "answer_uploaded",
        lastMessageText: summary.slice(0, 500),
        lastMessageAt: serverTimestamp(),
        lastAlertText: "تم رفع ملف الإجابة — بانتظار إيصال الحوالة من الطالب"
      });
      batch.set(doc(collection(actRef, "messages")), {
        activityId: act.id,
        senderId: uid,
        senderName: actorName,
        senderRole: "helper",
        text: summary,
        messageType: "file_event",
        participantUids: participants,
        createdAt: serverTimestamp()
      });
      await batch.commit();
      showToast("تم رفع ملف الإجابة بنجاح!");
    } catch (err) {
      showToast(err.message || "فشل رفع الإجابة");
    }
  });

  // Upload Receipt (File 3)
  document.getElementById("uploadReceiptBtn")?.addEventListener("click", async () => {
    const f = document.getElementById("receiptFileInput")?.files?.[0];
    if (!f) { showToast("يرجى اختيار ملف إيصال الحوالة أولاً"); return; }
    try {
      const att = await readFileAsAttachedObject(f);
      const actRef = doc(db, "activities", act.id);
      const summary = `قام الطالب ${actorName} برفع إيصال الحوالة (${att.name}) واكتمل النشاط نهائياً.`;
      const batch = writeBatch(db);
      batch.update(actRef, {
        receiptFileName: att.name,
        receiptFileType: att.mimeType,
        receiptFileData: att.base64Data,
        status: "completed",
        lastMessageText: summary.slice(0, 500),
        lastMessageAt: serverTimestamp(),
        lastAlertText: "مكتمل! تم إرفاق جميع الملفات الثلاثة وتوثيق النشاط نهائياً"
      });
      batch.set(doc(collection(actRef, "messages")), {
        activityId: act.id,
        senderId: uid,
        senderName: actorName,
        senderRole: "student",
        text: summary,
        messageType: "file_event",
        participantUids: participants,
        createdAt: serverTimestamp()
      });
      await batch.commit();
      showToast("اكتمل النشاط وتم توثيق الإيصال نهائياً!");
    } catch (err) {
      showToast(err.message || "فشل رفع الإيصال");
    }
  });

  // Transfer Activity
  document.getElementById("transferActBtn")?.addEventListener("click", async () => {
    const targetId = document.getElementById("transferTargetSelect")?.value || "";
    const target = state.helpers.find((h) => h.userId === targetId);
    if (!target) { showToast("اختر مساعداً بديلاً أولاً"); return; }
    try {
      const actRef = doc(db, "activities", act.id);
      const msgCol = collection(actRef, "messages");
      const msgSnap = isAdminHere
        ? await getDocs(msgCol)
        : await getDocs(query(msgCol, where("participantUids", "array-contains", uid)));
      const newParts = [act.studentId, target.userId];
      const summary = `تم تحويل النشاط إلى المساعد ${target.displayName} بواسطة ${actorName}`;
      const batch = writeBatch(db);
      const upd = {
        assignedHelperId: target.userId,
        assignedHelperName: target.displayName.slice(0, 100),
        transferCount: Number(act.transferCount || 0) + 1,
        lastTransferredBy: actorName,
        lastMessageText: summary.slice(0, 500),
        lastMessageAt: serverTimestamp(),
        lastAlertText: `تم تحويل المهمة إلى ${target.displayName}`.slice(0, 300)
      };
      if (!act.priceLocked) {
        upd.proposedPrice = 0;
        upd.proposedByUid = "";
        upd.studentApproved = false;
        upd.helperApproved = false;
      }
      batch.update(actRef, upd);
      batch.set(doc(msgCol), {
        activityId: act.id,
        senderId: uid,
        senderName: actorName,
        senderRole: actorRole,
        text: summary,
        messageType: "transfer_event",
        participantUids: newParts,
        createdAt: serverTimestamp()
      });
      await batch.commit();
      for (const mDoc of msgSnap.docs) {
        await updateDoc(mDoc.ref, { participantUids: newParts });
      }
      showToast("تم تحويل النشاط إلى " + target.displayName);
    } catch (err) {
      showToast("تعذر التحويل: " + err.message);
    }
  });

  // Submit Review
  document.getElementById("submitRateBtn")?.addEventListener("click", async () => {
    const rating = Number(document.getElementById("rateStarsSelect")?.value || 5);
    const comment = (document.getElementById("rateCommentInput")?.value || "").trim().slice(0, 1000);
    try {
      const payload = {
        activityId: act.id,
        helperId: act.assignedHelperId,
        studentId: uid,
        studentName: actorName,
        rating,
        isPublic: true,
        createdAt: serverTimestamp()
      };
      if (comment) payload.comment = comment;
      await setDoc(doc(db, "reviews", act.id), payload);
      showToast("شكراً لك! تم حفظ تقييم المساعد.");
    } catch (err) {
      showToast("تعذر إرسال التقييم: " + err.message);
    }
  });
}

function renderFileRow(label, fileName, fileData, mimeType, key) {
  if (!fileName) {
    return `<div style="display:flex; justify-content:space-between; font-size:0.86rem; color:var(--text-muted);"><span>${label}</span><span>غير مرفق بعد</span></div>`;
  }
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.86rem;">
      <span><strong>${label}:</strong> ${escapeHtml(fileName)}</span>
      <div style="display:flex; gap:6px;">
        ${fileData ? `<button type="button" class="btn btn-glass btn-sm" data-file-pv="${key}">معاينة</button>` : ""}
        ${fileData ? `<button type="button" class="btn btn-primary btn-sm" data-file-dl="${key}">${SVG_ICONS.download} <span>حفظ نسخة</span></button>` : ""}
      </div>
    </div>
  `;
}

function renderChatMessagesHtml() {
  if (!state.chatMessages.length) {
    return `<div style="text-align:center; color:var(--text-muted); font-size:0.86rem;">لا توجد رسائل بعد. ابدأ المحادثة الآن!</div>`;
  }
  return state.chatMessages.map((m) => {
    const isSystem = m.messageType === "system_alert" || m.messageType === "transfer_event" || m.messageType === "file_event" || m.messageType === "price_approved";
    const cls = isSystem ? "chat-bubble system" : (m.senderId === state.user.uid ? "chat-bubble mine" : "chat-bubble theirs");
    return `
      <div class="${cls}">
        ${!isSystem ? `<div style="font-size:0.74rem; opacity:0.82; font-weight:700;">${escapeHtml(m.senderName)}</div>` : ""}
        <div>${escapeHtml(m.text)}</div>
      </div>
    `;
  }).join("");
}

// ADMIN DASHBOARD (Full Governance on Web/iPhone)
function renderAdminDashboard() {
  const totalVol = state.activities.filter((a) => a.priceLocked).reduce((s, a) => s + Number(a.agreedPrice || 0), 0);
  pwaRoot.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div class="glass-card-elevated" style="padding:18px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <span class="pill pill-gold">${SVG_ICONS.shield} <span>لوحة قيادة المدير</span></span>
          <h2 style="margin:6px 0 2px; font-size:1.3rem;">الإشراف الكامل على Student Plus</h2>
          <div style="font-size:0.86rem; color:var(--text-muted);">
            الأنشطة: ${state.activities.length} • المستخدمون: ${state.adminUsers.length} • التداولات المثبتة: ${totalVol.toFixed(1)} ريال
          </div>
        </div>
        <button id="lockAdminBtn" type="button" class="btn btn-glass btn-sm">${SVG_ICONS.lock} <span>قفل البوابة</span></button>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm ${state.adminSubTab === "activities" ? "btn-primary" : "btn-glass"}" data-asub="activities">الأنشطة (${state.activities.length})</button>
        <button type="button" class="btn btn-sm ${state.adminSubTab === "users" ? "btn-primary" : "btn-glass"}" data-asub="users">المستخدمون (${state.adminUsers.length})</button>
        <button type="button" class="btn btn-sm ${state.adminSubTab === "reviews" ? "btn-primary" : "btn-glass"}" data-asub="reviews">التقييمات (${state.adminReviews.length})</button>
        <button type="button" class="btn btn-sm ${state.adminSubTab === "settings" ? "btn-primary" : "btn-glass"}" data-asub="settings">الإعدادات</button>
      </div>

      <div id="adminSubContent"></div>
    </div>
  `;

  document.getElementById("lockAdminBtn")?.addEventListener("click", () => {
    state.adminUnlocked = false;
    state.activeTab = "home";
    syncActivitiesSubscription(state.user);
    renderApp();
    showToast("تم قفل لوحة المدير");
  });
  pwaRoot.querySelectorAll("[data-asub]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminSubTab = btn.getAttribute("data-asub");
      renderAdminDashboard();
    });
  });

  const subEl = document.getElementById("adminSubContent");
  if (!subEl) return;

  if (state.adminSubTab === "activities") {
    subEl.innerHTML = `<div style="display:flex; flex-direction:column; gap:10px;">
      ${state.activities.map((a) => `
        <div class="glass-card" style="padding:14px;">
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <strong>${escapeHtml(a.title)}</strong>
            <span class="${statusMeta(a).cls}">${statusMeta(a).label}</span>
          </div>
          <div style="font-size:0.84rem; color:var(--text-muted); margin:4px 0 10px;">
            الطالب: ${escapeHtml(a.studentName)} • المساعد: ${escapeHtml(a.assignedHelperName || "بدون")} • السعر: ${a.agreedPrice || a.proposedPrice || 0} ريال
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-glass btn-sm adm-open" data-aid="${escapeHtml(a.id)}">تفاصيل ومحادثة</button>
            ${a.status !== "completed" ? `
              <button type="button" class="btn btn-glass btn-sm adm-freeze" data-aid="${escapeHtml(a.id)}">${a.isFrozen ? "فك التجميد" : "تجميد"}</button>
              <button type="button" class="btn btn-danger btn-sm adm-cancel" data-aid="${escapeHtml(a.id)}">إلغاء إداري</button>
            ` : ""}
          </div>
        </div>
      `).join("")}
    </div>`;

    subEl.querySelectorAll(".adm-open").forEach((b) => {
      b.addEventListener("click", () => {
        const a = state.activities.find((x) => x.id === b.getAttribute("data-aid"));
        if (a) renderActivityDetailModal(a, false);
      });
    });
    subEl.querySelectorAll(".adm-freeze").forEach((b) => {
      b.addEventListener("click", async () => {
        const a = state.activities.find((x) => x.id === b.getAttribute("data-aid"));
        if (!a) return;
        const nextFreeze = !a.isFrozen;
        const msg = nextFreeze ? "تم تجميد النشاط مؤقتاً من قبل الإدارة" : "تم فك تجميد النشاط من قبل الإدارة";
        try {
          await updateDoc(doc(db, "activities", a.id), {
            isFrozen: nextFreeze,
            frozenReason: nextFreeze ? "مراجعة إدارية" : "",
            adminNote: nextFreeze ? "مراجعة إدارية" : (a.adminNote || ""),
            lastMessageText: msg,
            lastMessageAt: serverTimestamp(),
            lastAlertText: msg
          });
          showToast(msg);
        } catch (err) { showToast(err.message); }
      });
    });
    subEl.querySelectorAll(".adm-cancel").forEach((b) => {
      b.addEventListener("click", async () => {
        const a = state.activities.find((x) => x.id === b.getAttribute("data-aid"));
        if (!a) return;
        try {
          await updateDoc(doc(db, "activities", a.id), {
            status: "cancelled",
            isFrozen: false,
            frozenReason: "",
            adminNote: "إلغاء إداري من لوحة المدير",
            lastMessageText: "تم إلغاء النشاط من قبل الإدارة",
            lastMessageAt: serverTimestamp(),
            lastAlertText: "تم إلغاء النشاط من قبل الإدارة"
          });
          showToast("تم إلغاء النشاط");
        } catch (err) { showToast(err.message); }
      });
    });
  } else if (state.adminSubTab === "users") {
    subEl.innerHTML = `<div style="display:flex; flex-direction:column; gap:12px;">
      <div class="glass-card" style="padding:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <strong>إدارة المساعدين والطلاب</strong>
          <div style="font-size:0.82rem; color:var(--text-muted);">تسجيل أي مساعد جديد أو ترقية طالب لا يتم إلا من هذه اللوحة.</div>
        </div>
        <button type="button" id="adminAddHelperBtn" class="btn btn-primary btn-sm">${SVG_ICONS.plus} <span>إضافة مساعد أو ترقية بالبريد</span></button>
      </div>

      ${state.adminHelperInvites.length ? `
        <div class="glass-card" style="padding:14px; background:var(--glass-subtle);">
          <strong style="display:block; margin-bottom:8px; font-size:0.92rem;">دعوات المساعدين المعلقة (${state.adminHelperInvites.length})</strong>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${state.adminHelperInvites.map((inv) => `
              <div class="glass-card" style="padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                <div>
                  <strong>${escapeHtml(inv.email)}</strong>
                  <div style="font-size:0.8rem; color:var(--text-muted);">
                    ${inv.displayName ? escapeHtml(inv.displayName) + " • " : ""}${inv.specialty ? escapeHtml(inv.specialty) : "يتفعل تلقائياً عند أول تسجيل دخول"}
                  </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm adm-del-invite" data-inv="${escapeHtml(inv.id)}">إلغاء الدعوة</button>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      ${state.adminUsers.map((u) => `
        <div class="glass-card" style="padding:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <strong>${escapeHtml(u.displayName)}</strong>
            <span class="pill ${u.role === "helper" ? "pill-emerald" : ""}" style="margin-inline-start:6px;">${u.role === "helper" ? "مساعد" : "طالب"}</span>
            ${u.isSuspended ? `<span class="pill pill-danger">مجمّد</span>` : ""}
            <div style="font-size:0.82rem; color:var(--text-muted);">${escapeHtml(u.email || "")}${u.specialty ? " • " + escapeHtml(u.specialty) : ""}</div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-glass btn-sm adm-edit-user" data-uid="${escapeHtml(u.userId)}">تعديل الدور والبيانات</button>
            <button type="button" class="btn btn-sm ${u.isSuspended ? "btn-emerald" : "btn-danger"} adm-susp" data-uid="${escapeHtml(u.userId)}">
              ${u.isSuspended ? "فك التجميد" : "تجميد الحساب"}
            </button>
          </div>
        </div>
      `).join("")}
    </div>`;

    document.getElementById("adminAddHelperBtn")?.addEventListener("click", () => openAdminAddHelperModal());
    subEl.querySelectorAll(".adm-del-invite").forEach((b) => {
      b.addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, "helper_invites", b.getAttribute("data-inv")));
          showToast("تم إلغاء دعوة المساعد");
        } catch (err) { showToast(err.message); }
      });
    });
    subEl.querySelectorAll(".adm-edit-user").forEach((b) => {
      b.addEventListener("click", () => {
        const u = state.adminUsers.find((x) => x.userId === b.getAttribute("data-uid"));
        if (u) openAdminEditUserModal(u);
      });
    });
    subEl.querySelectorAll(".adm-susp").forEach((b) => {
      b.addEventListener("click", async () => {
        const u = state.adminUsers.find((x) => x.userId === b.getAttribute("data-uid"));
        if (!u) return;
        const nextSusp = !u.isSuspended;
        try {
          await updateDoc(doc(db, "users", u.userId), {
            displayName: u.displayName,
            role: u.role || "student",
            specialty: u.specialty || "",
            isSuspended: nextSusp,
            suspensionReason: nextSusp ? "تجميد إداري للمراجعة" : "",
            updatedAt: serverTimestamp()
          });
          showToast(nextSusp ? "تم تجميد الحساب" : "تم تنشيط الحساب");
        } catch (err) { showToast(err.message); }
      });
    });
  } else if (state.adminSubTab === "reviews") {
    subEl.innerHTML = `<div style="display:flex; flex-direction:column; gap:10px;">
      ${state.adminReviews.length ? state.adminReviews.map((r) => `
        <div class="glass-card" style="padding:14px;">
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <strong style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.star} <span>${r.rating}/5 — ${escapeHtml(r.studentName)}</span></strong>
            <span class="${r.isPublic ? "pill pill-emerald" : "pill pill-danger"}">${r.isPublic ? "ظاهر" : "مخفي"}</span>
          </div>
          <p style="margin:6px 0 10px; font-size:0.9rem; color:var(--text-muted);">${escapeHtml(r.comment || "بدون تعليق")}</p>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-glass btn-sm adm-rev-toggle" data-rid="${escapeHtml(r.id)}">${r.isPublic ? "إخفاء" : "إظهار"}</button>
            <button type="button" class="btn btn-danger btn-sm adm-rev-del" data-rid="${escapeHtml(r.id)}">حذف نهائي</button>
          </div>
        </div>
      `).join("") : `<div class="glass-card" style="padding:22px; text-align:center; color:var(--text-muted);">لا توجد تقييمات مسجلة.</div>`}
    </div>`;
    subEl.querySelectorAll(".adm-rev-toggle").forEach((b) => {
      b.addEventListener("click", async () => {
        const r = state.adminReviews.find((x) => x.id === b.getAttribute("data-rid"));
        if (!r) return;
        await updateDoc(doc(db, "reviews", r.id), {
          isPublic: !r.isPublic,
          moderationReason: !r.isPublic ? "" : "تم الإخفاء إدارياً"
        });
      });
    });
    subEl.querySelectorAll(".adm-rev-del").forEach((b) => {
      b.addEventListener("click", async () => {
        await deleteDoc(doc(db, "reviews", b.getAttribute("data-rid")));
        showToast("تم حذف التقييم");
      });
    });
  } else {
    const s = state.platformSettings;
    const curPin = localStorage.getItem(ADMIN_PIN_KEY) || cfg.defaultAdminPin || "2468";
    subEl.innerHTML = `
      <div class="glass-card-elevated" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
        <div class="grid-3">
          <div>
            <label class="field-label" for="setMinPrice">الحد الأدنى للسعر (ريال)</label>
            <input id="setMinPrice" class="input" type="number" min="0" value="${Number(s.minActivityPrice || 10)}" />
          </div>
          <div>
            <label class="field-label" for="setDeadlineH">المهلة الافتراضية (ساعة)</label>
            <input id="setDeadlineH" class="input" type="number" min="1" max="720" value="${Number(s.defaultDeadlineHours || 72)}" />
          </div>
          <div>
            <label class="field-label" for="setStalledH">تنبيه التعثر بعد (ساعة)</label>
            <input id="setStalledH" class="input" type="number" min="1" max="720" value="${Number(s.stalledThresholdHours || 24)}" />
          </div>
        </div>
        <div>
          <label class="field-label" for="setNotice">تنويه المنصة العام</label>
          <input id="setNotice" class="input" maxlength="400" value="${escapeHtml(s.maintenanceNotice || "")}" placeholder="تنويه يظهر للجميع في الأعلى..." />
        </div>
        <label style="display:flex; align-items:center; gap:8px; font-weight:700;">
          <input id="setAllowNew" type="checkbox" ${s.allowNewActivities !== false ? "checked" : ""} />
          <span>السماح بطرح أنشطة جديدة</span>
        </label>
        <div>
          <label class="field-label" for="setAdminPin">تغيير رمز PIN لبوابة الويب</label>
          <input id="setAdminPin" class="input" maxlength="10" value="${escapeHtml(curPin)}" />
        </div>
        <button id="saveAdminSettingsBtn" type="button" class="btn btn-primary">حفظ إعدادات المنصة</button>
      </div>
    `;
    document.getElementById("saveAdminSettingsBtn")?.addEventListener("click", async () => {
      try {
        await setDoc(doc(db, "platform_settings", "global"), {
          minActivityPrice: Math.max(0, Number(document.getElementById("setMinPrice")?.value || 10)),
          defaultDeadlineHours: Math.max(1, Math.min(720, Number(document.getElementById("setDeadlineH")?.value || 72))),
          stalledThresholdHours: Math.max(1, Math.min(720, Number(document.getElementById("setStalledH")?.value || 24))),
          maintenanceNotice: (document.getElementById("setNotice")?.value || "").trim().slice(0, 400),
          allowNewActivities: Boolean(document.getElementById("setAllowNew")?.checked),
          updatedAt: serverTimestamp()
        }, { merge: true });
        const newPin = (document.getElementById("setAdminPin")?.value || "").trim();
        if (newPin.length >= 4) localStorage.setItem(ADMIN_PIN_KEY, newPin);
        showToast("تم حفظ إعدادات المنصة بنجاح!");
      } catch (err) {
        showToast("تعذر الحفظ: " + err.message);
      }
    });
  }
}

function openAdminAddHelperModal() {
  openModal(`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">إضافة مساعد جديد أو ترقية طالب</h3>
      <button type="button" class="icon-btn" id="closeAddHelperModalBtn" aria-label="إغلاق">${SVG_ICONS.close}</button>
    </div>
    <p style="font-size:0.88rem; color:var(--text-muted); margin:0 0 14px;">
      إذا كان المستخدم مسجلاً مسبقاً ستتم ترقيته فوراً إلى مساعد، وإذا لم يسجل بعد فسيُفعّل حسابه كمساعد تلقائياً عند أول دخول بنفس البريد الإلكتروني.
    </p>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <label class="field-label" for="addHelperEmailInput">بريد Google الإلكتروني *</label>
        <input id="addHelperEmailInput" class="input" type="email" maxlength="150" placeholder="helper@gmail.com" dir="ltr" />
      </div>
      <div>
        <label class="field-label" for="addHelperNameInput">اسم العرض (اختياري)</label>
        <input id="addHelperNameInput" class="input" maxlength="100" placeholder="مثال: أ. خالد العتيبي" />
      </div>
      <div>
        <label class="field-label" for="addHelperSpecInput">التخصص الأكاديمي (اختياري)</label>
        <input id="addHelperSpecInput" class="input" maxlength="120" placeholder="مثال: برمجة، رياضيات، هندسة" />
      </div>
      <div id="addHelperErrBox" style="color:var(--danger); font-size:0.84rem;"></div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" class="btn btn-glass" id="cancelAddHelperBtn">إلغاء</button>
        <button type="button" class="btn btn-primary" id="submitAddHelperBtn">حفظ وإضافة المساعد</button>
      </div>
    </div>
  `);
  document.getElementById("closeAddHelperModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("cancelAddHelperBtn")?.addEventListener("click", closeModal);
  document.getElementById("submitAddHelperBtn")?.addEventListener("click", async () => {
    const emailLower = (document.getElementById("addHelperEmailInput")?.value || "").trim().toLowerCase().slice(0, 150);
    const nameInput = (document.getElementById("addHelperNameInput")?.value || "").trim().slice(0, 100);
    const specInput = (document.getElementById("addHelperSpecInput")?.value || "").trim().slice(0, 120);
    const errBox = document.getElementById("addHelperErrBox");
    if (errBox) errBox.textContent = "";

    if (!emailLower || !emailLower.includes("@") || !emailLower.includes(".") || emailLower.includes("/")) {
      if (errBox) errBox.textContent = "يرجى إدخال بريد إلكتروني صحيح.";
      return;
    }

    const btn = document.getElementById("submitAddHelperBtn");
    if (btn) btn.disabled = true;

    try {
      const existingUser = state.adminUsers.find((u) => (u.email || "").trim().toLowerCase() === emailLower);
      if (existingUser) {
        const finalName = (nameInput || existingUser.displayName || "مساعد").slice(0, 100);
        const batch = writeBatch(db);
        batch.update(doc(db, "users", existingUser.userId), {
          displayName: finalName,
          role: "helper",
          specialty: specInput,
          isSuspended: Boolean(existingUser.isSuspended),
          suspensionReason: existingUser.suspensionReason || "",
          updatedAt: serverTimestamp()
        });
        const dirRef = doc(db, "helper_directory", existingUser.userId);
        const dirSnap = await getDoc(dirRef);
        if (dirSnap.exists()) {
          batch.update(dirRef, { displayName: finalName, specialty: specInput });
        } else {
          batch.set(dirRef, {
            userId: existingUser.userId,
            displayName: finalName,
            role: "helper",
            specialty: specInput,
            createdAt: serverTimestamp()
          });
        }
        await batch.commit();
        closeModal();
        showToast("تمت ترقية الحساب إلى مساعد وتفعيله في الدليل فوراً.");
      } else {
        const invitePayload = {
          email: emailLower,
          createdAt: serverTimestamp()
        };
        if (nameInput) invitePayload.displayName = nameInput;
        if (specInput) invitePayload.specialty = specInput;
        await setDoc(doc(db, "helper_invites", emailLower), invitePayload);
        closeModal();
        showToast("تم تسجيل دعوة المساعد وسيُفعّل تلقائياً عند أول دخول.");
      }
    } catch (err) {
      if (errBox) errBox.textContent = err.message || "تعذر تنفيذ العملية";
      if (btn) btn.disabled = false;
    }
  });
}

function openAdminEditUserModal(u) {
  let chosenRole = u.role === "helper" ? "helper" : "student";
  openModal(`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">تعديل المستخدم والدور</h3>
      <button type="button" class="icon-btn" id="closeEditUserModalBtn" aria-label="إغلاق">${SVG_ICONS.close}</button>
    </div>
    <div style="font-size:0.84rem; color:var(--text-muted); margin-bottom:12px;">${escapeHtml(u.email || u.userId)}</div>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <label class="field-label" for="editUserNameInput">الاسم</label>
        <input id="editUserNameInput" class="input" maxlength="100" value="${escapeHtml(u.displayName || "")}" />
      </div>
      <div>
        <span class="field-label">الدور في المنصة</span>
        <div style="display:flex; gap:8px;">
          <button type="button" id="editRoleStudentBtn" class="btn btn-sm ${chosenRole === "student" ? "btn-primary" : "btn-glass"}" style="flex:1;">طالب</button>
          <button type="button" id="editRoleHelperBtn" class="btn btn-sm ${chosenRole === "helper" ? "btn-emerald" : "btn-glass"}" style="flex:1;">مساعد</button>
        </div>
      </div>
      <div id="editUserSpecWrap" style="display:${chosenRole === "helper" ? "block" : "none"};">
        <label class="field-label" for="editUserSpecInput">التخصص</label>
        <input id="editUserSpecInput" class="input" maxlength="120" value="${escapeHtml(u.specialty || "")}" />
      </div>
      <div id="editUserErrBox" style="color:var(--danger); font-size:0.84rem;"></div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" class="btn btn-glass" id="cancelEditUserBtn">إلغاء</button>
        <button type="button" class="btn btn-primary" id="submitEditUserBtn">حفظ التغييرات</button>
      </div>
    </div>
  `);

  const rsBtn = document.getElementById("editRoleStudentBtn");
  const rhBtn = document.getElementById("editRoleHelperBtn");
  const specWrap = document.getElementById("editUserSpecWrap");
  function syncEditRole() {
    if (rsBtn) rsBtn.className = `btn btn-sm ${chosenRole === "student" ? "btn-primary" : "btn-glass"}`;
    if (rhBtn) rhBtn.className = `btn btn-sm ${chosenRole === "helper" ? "btn-emerald" : "btn-glass"}`;
    if (specWrap) specWrap.style.display = chosenRole === "helper" ? "block" : "none";
  }
  rsBtn?.addEventListener("click", () => { chosenRole = "student"; syncEditRole(); });
  rhBtn?.addEventListener("click", () => { chosenRole = "helper"; syncEditRole(); });

  document.getElementById("closeEditUserModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("cancelEditUserBtn")?.addEventListener("click", closeModal);
  document.getElementById("submitEditUserBtn")?.addEventListener("click", async () => {
    const newName = (document.getElementById("editUserNameInput")?.value || "").trim().slice(0, 100) || u.displayName;
    const newSpec = chosenRole === "helper" ? (document.getElementById("editUserSpecInput")?.value || "").trim().slice(0, 120) : "";
    const errBox = document.getElementById("editUserErrBox");
    const btn = document.getElementById("submitEditUserBtn");
    if (btn) btn.disabled = true;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", u.userId), {
        displayName: newName,
        role: chosenRole,
        specialty: newSpec,
        isSuspended: Boolean(u.isSuspended),
        suspensionReason: u.suspensionReason || "",
        updatedAt: serverTimestamp()
      });
      const dirRef = doc(db, "helper_directory", u.userId);
      const dirSnap = await getDoc(dirRef);
      if (chosenRole === "helper") {
        if (dirSnap.exists()) {
          batch.update(dirRef, { displayName: newName, specialty: newSpec });
        } else {
          batch.set(dirRef, {
            userId: u.userId,
            displayName: newName,
            role: "helper",
            specialty: newSpec,
            createdAt: serverTimestamp()
          });
        }
      } else if (dirSnap.exists()) {
        batch.delete(dirRef);
      }
      await batch.commit();
      closeModal();
      showToast("تم تحديث بيانات ودور المستخدم بنجاح");
    } catch (err) {
      if (errBox) errBox.textContent = err.message || "تعذر التحديث";
      if (btn) btn.disabled = false;
    }
  });
}

const API_BASE = "";

let currentVideoId = "";
let videoPlayer = null;

// Initialize
window.onload = () => {
  videoPlayer = document.getElementById("videoPlayer");
  loadVideos();
  loadSavedTheme();

  setTimeout(() => {
    const select = document.getElementById("videoSelect");
    if (select.options.length > 1) {
      select.value = "demo";
      loadVideoMetadata();
      loadVideoSource();
    }
  }, 600);
};

// Core functions
async function loadVideos() {
  const res = await fetch(`${API_BASE}/video`);
  const data = await res.json();
  const select = document.getElementById("videoSelect");
  select.innerHTML = '<option value="">-- Select Video --</option>';
  data.videos.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.id.toUpperCase();
    select.appendChild(opt);
  });
}

async function loadVideoMetadata() {
  currentVideoId = document.getElementById("videoSelect").value;
  if (!currentVideoId) return;

  const res = await fetch(`${API_BASE}/video/${currentVideoId}`);
  const data = await res.json();
  document.getElementById("metadata").textContent = JSON.stringify(data, null, 2);
  loadVideoSource();
}

function loadVideoSource() {
  if (currentVideoId && videoPlayer) {
    videoPlayer.src = "/static/oop.mp4";
    videoPlayer.load();
  }
}

function togglePlay() {
  if (!videoPlayer) return;
  if (!videoPlayer.src) loadVideoSource();

  if (videoPlayer.paused) {
    videoPlayer.play();
    document.querySelector("#playBtn i").classList.replace("fa-play", "fa-pause");
    document.getElementById("playText").textContent = "Pause";
  } else {
    videoPlayer.pause();
    document.querySelector("#playBtn i").classList.replace("fa-pause", "fa-play");
    document.getElementById("playText").textContent = "Play";
  }
}

function seek(seconds) {
  if (videoPlayer) videoPlayer.currentTime += seconds;
}

function jumpToTime() {
  const min = parseInt(document.getElementById("minutes").value) || 0;
  const sec = parseInt(document.getElementById("seconds").value) || 0;
  if (videoPlayer) videoPlayer.currentTime = min * 60 + sec;
}

// Simplified OCR - delegates cleaning to backend
async function runOCR() {
  if (!currentVideoId || !videoPlayer || videoPlayer.currentTime <= 0) {
    alert("Please play the video first then click Scan Text");
    return;
  }

  const seconds = Math.floor(videoPlayer.currentTime);
  const resultDiv = document.getElementById("ocrResult");
  resultDiv.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> Scanning at ${seconds}s...</p>`;

  try {
    const res = await fetch(`${API_BASE}/video/${currentVideoId}/ocr?t=${seconds}`);
    const data = await res.json();

    resultDiv.innerHTML = `${data.text 
        ? `<div class="ocr-text">${data.text}</div>` 
        : '<em>No text detected.</em>'}
    `;
  } catch (e) {
    resultDiv.innerHTML = `<p style="color:#ff6666;">OCR failed</p>`;
  }
}

// Theme Support
function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const newTheme = isLight ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  const icon = document.querySelector("#themeToggle i");
  icon.classList.toggle("fa-moon", !isLight);
  icon.classList.toggle("fa-sun", isLight);
}

function loadSavedTheme() {
  const theme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
}

// Keyboard Shortcuts (kept minimal)
document.addEventListener("keydown", e => {
  if (e.key === "o" || e.key === "O") runOCR();
  if (e.key === "f" || e.key === "F") document.querySelector(".video-area")?.requestFullscreen();
  if (e.key === "ArrowRight") seek(10);
  if (e.key === "ArrowLeft") seek(-10);
  if (e.key === " ") { e.preventDefault(); togglePlay(); }
});
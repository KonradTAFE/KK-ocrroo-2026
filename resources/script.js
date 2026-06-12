// resources/script.js

const API_BASE = "";  // Empty = same origin when served from FastAPI

let currentVideoId = "";
let videoPlayer = null;
let currentVolume = 1.0;
let isMuted = false;

// Initialize
window.onload = () => {
  videoPlayer = document.getElementById("videoPlayer");
  loadVideos();

  // Auto load demo video
  setTimeout(() => {
    const select = document.getElementById("videoSelect");
    if (select.options.length > 1) {
      select.value = "demo";
      loadVideoMetadata();
      loadVideoSource();
    }
  }, 800);
};

// Load list of videos
async function loadVideos() {
  try {
    const res = await fetch(`${API_BASE}/video`);
    if (!res.ok) throw new Error("Failed to fetch videos");

    const data = await res.json();
    const select = document.getElementById("videoSelect");

    select.innerHTML = '<option value="">-- Select Video --</option>';

    data.videos.forEach(video => {
      const option = document.createElement("option");
      option.value = video.id;
      option.textContent = video.id.toUpperCase();
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading videos:", error);
  }
}

// Load metadata
async function loadVideoMetadata() {
  currentVideoId = document.getElementById("videoSelect").value;
  if (!currentVideoId) return;

  try {
    const res = await fetch(`${API_BASE}/video/${currentVideoId}`);
    if (!res.ok) throw new Error("Failed to load metadata");

    const data = await res.json();
    document.getElementById("metadata").textContent = JSON.stringify(data, null, 2);

    loadVideoSource();
  } catch (error) {
    console.error("Error loading metadata:", error);
    document.getElementById("metadata").textContent = "Error loading metadata";
  }
}

// Load video source
function loadVideoSource() {
  if (currentVideoId && videoPlayer) {
    videoPlayer.src = "/static/oop.mp4";   // Change if your video path differs
    videoPlayer.load();
  }
}

// Toggle Play/Pause
function togglePlay() {
  if (!videoPlayer) return;

  if (!videoPlayer.src) loadVideoSource();

  if (videoPlayer.paused) {
    videoPlayer.play();
    updatePlayButton(true);
  } else {
    videoPlayer.pause();
    updatePlayButton(false);
  }
}

function updatePlayButton(isPlaying) {
  const icon = document.querySelector("#playBtn i");
  const text = document.getElementById("playText");

  if (isPlaying) {
    icon.classList.replace("fa-play", "fa-pause");
    text.textContent = "Pause";
  } else {
    icon.classList.replace("fa-pause", "fa-play");
    text.textContent = "Play";
  }
}

// Seek
function seek(seconds) {
  if (videoPlayer) videoPlayer.currentTime += seconds;
}

// Jump to time
function jumpToTime() {
  const seconds = parseFloat(document.getElementById("seconds").value);
  if (videoPlayer && !isNaN(seconds)) {
    videoPlayer.currentTime = seconds;
    videoPlayer.play();
    updatePlayButton(true);
  }
}

// OCR Function
async function runOCR() {
  const seconds = parseInt(document.getElementById("seconds").value) ||
                  Math.floor(videoPlayer ? videoPlayer.currentTime : 223);

  if (!currentVideoId) {
    alert("Please select a video first");
    return;
  }

  const resultDiv = document.getElementById("ocrResult");
  resultDiv.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> Running OCR...</p>`;

  try {
    const res = await fetch(`${API_BASE}/video/${currentVideoId}/frame/${seconds}/ocr`);
    if (!res.ok) throw new Error("OCR failed");

    const data = await res.json();

    resultDiv.innerHTML = `
      <strong><i class="fas fa-clock"></i> Time:</strong> ${data.timestamp}s<br><br>
      ${data.text 
        ? `<i class="fas fa-quote-left"></i> ${data.text.replace(/\n/g, '<br>')}` 
        : '<i class="fas fa-info-circle"></i> No text detected in this frame.'}
    `;
  } catch (error) {
    console.error("OCR Error:", error);
    resultDiv.innerHTML = `
      <p style="color:#ff6666;">
        <i class="fas fa-exclamation-triangle"></i> Failed to extract text. Try another time.
      </p>`;
  }
}

// Volume Control
function changeVolume(delta) {
  if (!videoPlayer) return;

  currentVolume = Math.max(0, Math.min(1, currentVolume + delta));
  videoPlayer.volume = currentVolume;
}

// Mute Toggle
function toggleMute() {
  if (!videoPlayer) return;

  isMuted = !isMuted;
  videoPlayer.muted = isMuted;

  const icon = document.getElementById("muteIcon");
  icon.classList.toggle("fa-volume-high", !isMuted);
  icon.classList.toggle("fa-volume-xmark", isMuted);
}

// Fullscreen
function toggleFullscreen() {
  const videoArea = document.querySelector(".video-area");
  if (videoArea.requestFullscreen) videoArea.requestFullscreen();
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "o":
    case "O":
      runOCR();
      break;
    case "f":
    case "F":
      toggleFullscreen();
      break;
    case "ArrowRight":
      seek(10);
      break;
    case "ArrowLeft":
      seek(-10);
      break;
    case "ArrowUp":
      e.preventDefault();
      changeVolume(0.1);
      break;
    case "ArrowDown":
      e.preventDefault();
      changeVolume(-0.1);
      break;
    case " ":
      e.preventDefault();
      togglePlay();
      break;
  }
});
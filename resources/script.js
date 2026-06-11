// resources/script.js

const API_BASE = "http://127.0.0.1:8000";
let currentVideoId = "";

// Load list of videos when page loads
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
    alert("Could not connect to the FastAPI server. Make sure it's running.");
  }
}

// Load metadata when a video is selected
async function loadVideoMetadata() {
  currentVideoId = document.getElementById("videoSelect").value;
  if (!currentVideoId) return;

  try {
    const res = await fetch(`${API_BASE}/video/${currentVideoId}`);
    if (!res.ok) throw new Error("Video not found");

    const data = await res.json();
    document.getElementById("metadata").textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error loading metadata:", error);
    document.getElementById("metadata").textContent = "Error loading metadata";
  }
}

// Show frame at selected time
async function showFrame() {
  const secondsInput = document.getElementById("seconds");
  const seconds = parseFloat(secondsInput.value);

  if (!currentVideoId) {
    alert("Please select a video first");
    return;
  }

  document.getElementById("currentTime").textContent = seconds.toFixed(1);

  const img = document.getElementById("frameImage");
  img.src = `${API_BASE}/video/${currentVideoId}/frame/${seconds}`;
}

// Run OCR on current frame
async function runOCR() {
  const seconds = parseInt(document.getElementById("seconds").value);

  if (!currentVideoId) {
    alert("Please select a video first");
    return;
  }

  const resultDiv = document.getElementById("ocrResult");
  resultDiv.innerHTML = "<p>🔄 Running OCR... Please wait.</p>";

  try {
    const res = await fetch(`${API_BASE}/video/${currentVideoId}/frame/${seconds}/ocr`);
    if (!res.ok) throw new Error("OCR request failed");

    const data = await res.json();

    resultDiv.innerHTML = `
      <strong>Time:</strong> ${data.timestamp}s<br><br>
      ${data.text 
        ? data.text.replace(/\n/g, '<br>') 
        : '<em>No text detected in this frame.</em>'}
    `;
  } catch (error) {
    console.error("OCR Error:", error);
    resultDiv.innerHTML = `<p style="color:#ff6666;">❌ Failed to extract text. Try another time.</p>`;
  }
}

// Seek forward or backward
function seek(delta) {
  const secondsInput = document.getElementById("seconds");
  let current = parseFloat(secondsInput.value) || 0;
  secondsInput.value = Math.max(0, current + delta);
  showFrame();
}

// Dummy functions for controls
function togglePlay() {
  alert("🎬 Video playback simulation.\n\nUse the time input + 'Show Frame' button for now.");
}

function toggleMute() {
  alert("🔇 Mute toggled (demo)");
}

function toggleFullscreen() {
  const videoArea = document.querySelector(".video-area");
  if (videoArea.requestFullscreen) {
    videoArea.requestFullscreen();
  } else {
    alert("Fullscreen not supported in this browser");
  }
}

// Keyboard shortcuts
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
    case " ":
      e.preventDefault();
      togglePlay();
      break;
  }
});

// Initialize everything when page loads
window.onload = loadVideos;
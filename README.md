# Video OCR Explorer

A modern web application that combines video playback with Optical Character Recognition (OCR). 
Users can play videos and extract readable text from any frame in real-time.

## Overview

This project demonstrates a client-server architecture using FastAPI as the backend and a clean HTML + JavaScript frontend. It allows users to:

- Play videos with native HTML5 player
- Extract frames at any timestamp
- Perform real-time OCR on video frames
- Switch between Light and Dark themes
- Use keyboard shortcuts for better UX
The main goal is to make video content more accessible by extracting text from video frames, helping users who have difficulty reading text displayed in videos.

## How to Deploy and Run the Project

### Prerequisites
- Python 3.10 or higher
- Tesseract OCR installed on your system  
  → [Download Tesseract for Windows](https://github.com/tesseract-ocr/tesseract/releases/download/5.5.0/tesseract-ocr-w64-setup-5.5.0.20241111.exe)

### Installation

1. Clone or navigate to the project directory.
2. Install dependencies (recommended with UV):
   ``` bash
   uv sync
   ```
    Or with pip:
    ``` bash
    pip install fastapi uvicorn pytesseract opencv-python pillow python-multipart
    ```
3. Ensure your video file is located in the 'resources' folder.
4. Run the application:
    ```bash
    uv run fastapi dev api.py
    ```
5. Open your browser and go to http://127.0.0.1:8000

### Core Dependencies
- FastAPI - High-performance web framework 
- OpenCV (cv2) - Video frame extraction and processing
- pytesseract - Python wrapper for Tesseract 
- Tesseract OCR - Engine for text recognition (system-level)
- HTML5 + Vanilla JavaScript - Frontend interface

### Who is it for and Why?
This project is primarily designed for students with visual impairments.
Many educational videos contain important text (slides, code examples, titles, or written explanations) that is not accessible through standard screen readers. 
Video OCR Explorer helps bridge this gap by allowing users to:
- Play educational videos
- Jump to any timestamp
- Instantly extract and display the text visible on screen using OCR
This allows visually impaired students to better understand and engage with video-based learning materials that would otherwise be difficult or impossible to access.

### Key Features
- Real-time video frame OCR
- Light / Dark theme personalization (saved in browser)
- Keyboard shortcuts support
- Clean, responsive UI
- Metadata display in table format


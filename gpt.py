import sys
import cv2
import pytesseract
import pyttsx3
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QSlider, QLabel, QFileDialog, QMessageBox
)
from PyQt6.QtCore import Qt, QTimer, QUrl
from PyQt6.QtGui import QKeySequence, QAction
import vlc


class VideoPlayer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("OCR Video Player - Accessibility Tool")
        self.resize(1280, 720)

        # VLC Player
        self.instance = vlc.Instance()
        self.mediaplayer = self.instance.media_player_new()

        # TTS Engine
        self.tts = pyttsx3.init()
        self.tts.setProperty('rate', 150)  # Adjust speed

        self.init_ui()
        self.setup_shortcuts()

        # Timer for updating slider and checking position
        self.timer = QTimer(self)
        self.timer.setInterval(300)  # Update every 300ms
        self.timer.timeout.connect(self.update_ui)

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        # Video display widget
        self.video_frame = QWidget(self)
        self.video_frame.setMinimumHeight(500)
        self.video_frame.setStyleSheet("background-color: black;")
        main_layout.addWidget(self.video_frame)

        # Attach VLC to the widget (Windows)
        if sys.platform.startswith('win'):
            self.mediaplayer.set_hwnd(self.video_frame.winId())

        # Controls Layout
        controls_layout = QHBoxLayout()

        self.btn_open = QPushButton("Open Video")
        self.btn_open.clicked.connect(self.open_file)
        controls_layout.addWidget(self.btn_open)

        self.btn_play = QPushButton("Play")
        self.btn_play.clicked.connect(self.toggle_play)
        controls_layout.addWidget(self.btn_play)

        self.btn_ocr = QPushButton("OCR Current Frame + Read")
        self.btn_ocr.clicked.connect(self.extract_and_read)
        controls_layout.addWidget(self.btn_ocr)

        main_layout.addLayout(controls_layout)

        # Progress Slider
        self.position_slider = QSlider(Qt.Orientation.Horizontal)
        self.position_slider.setRange(0, 1000)
        self.position_slider.sliderMoved.connect(self.set_position)
        main_layout.addWidget(self.position_slider)

        # Status Label
        self.status_label = QLabel("Ready - Open a video file")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(self.status_label)

    def setup_shortcuts(self):
        """Essential keyboard shortcuts for accessibility"""

        # Play/Pause - Space
        play_pause_action = QAction("Play/Pause", self)
        play_pause_action.setShortcut(QKeySequence("Space"))
        play_pause_action.triggered.connect(self.toggle_play)
        self.addAction(play_pause_action)

        # Open File - Ctrl+O
        open_action = QAction("Open Video", self)
        open_action.setShortcut(QKeySequence("Ctrl+O"))
        open_action.triggered.connect(self.open_file)
        self.addAction(open_action)

        # OCR Current Frame - Ctrl+R
        ocr_action = QAction("OCR Frame", self)
        ocr_action.setShortcut(QKeySequence("Ctrl+R"))
        ocr_action.triggered.connect(self.extract_and_read)
        self.addAction(ocr_action)

    def open_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Open Video File", "",
            "Video Files (*.mp4 *.mkv *.avi *.mov *.wmv)"
        )
        if file_path:
            media = self.instance.media_new(file_path)
            self.mediaplayer.set_media(media)
            self.mediaplayer.play()
            self.timer.start()
            self.status_label.setText(f"Playing: {file_path.split('/')[-1]}")

    def toggle_play(self):
        if self.mediaplayer.is_playing():
            self.mediaplayer.pause()
            self.btn_play.setText("Play")
        else:
            self.mediaplayer.play()
            self.btn_play.setText("Pause")

    def set_position(self, position):
        self.mediaplayer.set_position(position / 1000.0)

    def update_ui(self):
        """Update slider position"""
        if self.mediaplayer.is_playing():
            position = self.mediaplayer.get_position()
            self.position_slider.setValue(int(position * 1000))

    def extract_and_read(self):
        """Capture current frame → OCR → Text-to-Speech"""
        if not self.mediaplayer.is_playing() and not self.mediaplayer.get_position() > 0:
            QMessageBox.warning(self, "Warning", "Play a video first!")
            return

        try:
            # Get current frame as image
            buf = self.mediaplayer.get_frame_at_time(self.mediaplayer.get_time() / 1000.0)
            if buf is None:
                # Alternative method using OpenCV
                self.status_label.setText("Capturing frame...")
                QApplication.processEvents()

                # More reliable method
                frame = self.capture_current_frame()
                if frame is None:
                    self.status_label.setText("Failed to capture frame")
                    return
            else:
                frame = buf

            # Preprocess for better OCR
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # OCR
            text = pytesseract.image_to_string(gray).strip()

            if text:
                self.status_label.setText(f"Detected: {text[:80]}...")
                print("OCR Result:", text)  # For debugging
                self.tts.say(text)
                self.tts.runAndWait()
            else:
                self.status_label.setText("No text detected in current frame")

        except Exception as e:
            QMessageBox.critical(self, "Error", f"OCR failed: {str(e)}")

    def capture_current_frame(self):
        """Capture current video frame using OpenCV"""
        try:
            # This is a simple fallback method
            pos = self.mediaplayer.get_position()
            # In a full implementation you might save a temporary screenshot or use VLC callbacks
            # For now we show the concept
            self.status_label.setText("Frame capture simulated...")
            return None  # Placeholder - we'll improve this
        except:
            return None


if __name__ == "__main__":
    app = QApplication(sys.argv)
    player = VideoPlayer()
    player.show()
    sys.exit(app.exec())
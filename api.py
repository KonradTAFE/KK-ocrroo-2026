"""Provides a simple API for OCR client"""

import pytesseract
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path

from preliminary.library_basics import CodingVideo

app = FastAPI(title="Video OCR Explorer")

# Video Database
VIDEOS: dict[str, Path] = {
    "demo": Path("resources/oop.mp4")
}

class VideoMetaData(BaseModel):
    fps: float
    frame_count: int
    duration_seconds: float
    _links: dict | None = None


def _open_vid_or_404(vid: str) -> CodingVideo:
    path = VIDEOS.get(vid)
    if not path or not path.is_file():
        raise HTTPException(status_code=404, detail="Video not found")
    try:
        return CodingVideo(path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Could not open video: {e}")

# Video list
@app.get("/video")
def list_videos():
    return {
        "count": len(VIDEOS),
        "videos": [
            {
                "id": vid,
                "path": str(path),
                "_links": {
                    "self": f"/video/{vid}",
                    "frame_example": f"/video/{vid}/frame/1.0"
                }
            }
            for vid, path in VIDEOS.items()
        ]
    }

# Metadata
@app.get("/video/{vid}", response_model=VideoMetaData)
def get_video(vid: str):
    video = _open_vid_or_404(vid)
    try:
        meta = VideoMetaData(
            fps=video.fps,
            frame_count=int(video.frame_count),
            duration_seconds=round(video.duration, 2)
        )
        meta._links = {
            "self": f"/video/{vid}",
            "frames": f"/video/{vid}/frame/{{seconds}}"
        }
        return meta
    finally:
        video.capture.release()

# Frame extraction
@app.get("/video/{vid}/frame/{t}", response_class=Response)
def video_frame(vid: str, t: float):
    video = _open_vid_or_404(vid)
    try:
        return Response(
            content=video.get_image_as_bytes(t),
            media_type="image/png"
        )
    finally:
        video.capture.release()


# OCR - text extraction
@app.get("/video/{vid}/ocr")
def video_ocr(vid: str, t: float = None):
    """Perform OCR at a specific time or current video time"""
    video = _open_vid_or_404(vid)
    try:
        if t is None or t < 0:
            t = video.duration / 2  # default to middle

        frame = video.get_frame_number_at_time(int(t))
        rgb = video.get_frame_rgb_array(frame)

        text = pytesseract.image_to_string(rgb, lang="eng")


        return {
            "video": vid,
            "timestamp": round(t, 2),
            "frame_number": frame,
            "text": text,
        }
    finally:
        video.capture.release()


# Serve static files
static_path = Path("resources")
if static_path.exists():
    app.mount("/static", StaticFiles(directory=static_path), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_home():
        return FileResponse("index.html")
else:
    print("Warning: resources folder not found")
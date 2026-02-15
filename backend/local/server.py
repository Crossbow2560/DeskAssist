import asyncio
import json
import threading
import time

import cv2
import numpy as np
import mediapipe as mp
import websockets

from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from lib.focus_metrics import FocusMetrics


# ==============================
# Shared Data
# ==============================

latest_metrics = {}
lock = threading.Lock()


# ==============================
# Load MediaPipe Model
# ==============================

base_options = python.BaseOptions(model_asset_path="face_landmarker.task")

options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1
)

detector = vision.FaceLandmarker.create_from_options(options)


# ==============================
# Head Pose Model
# ==============================

model_points = np.array([
    (0.0, 0.0, 0.0),
    (0.0, -330.0, -65.0),
    (-225.0, 170.0, -135.0),
    (225.0, 170.0, -135.0),
    (-150.0, -150.0, -125.0),
    (150.0, -150.0, -125.0)
])

NOSE = 1
CHIN = 152
LEFT_EYE_CORNER = 33
RIGHT_EYE_CORNER = 263
LEFT_MOUTH = 78
RIGHT_MOUTH = 308


# ==============================
# Camera Thread
# ==============================

def camera_loop():
    global latest_metrics

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    metrics = FocusMetrics()
    prev_time = 0

    print("Camera started:", cap.isOpened())

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        h, w, _ = frame.shape

        # FPS
        current_time = time.time()
        fps = 1 / (current_time - prev_time) if prev_time != 0 else 0
        prev_time = current_time

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        result = detector.detect(mp_image)

        values = {}

        if result.face_landmarks:
            landmarks = result.face_landmarks[0]

            values = metrics.compute(
                landmarks,
                w,
                h,
                yaw=None,
                pitch=None,
                roll=None
            )

        values["fps"] = int(fps)

        clean_values = {
            k: float(v) if isinstance(v, (np.float32, np.float64)) else v
            for k, v in values.items()
        }

        with lock:
            latest_metrics = clean_values


# Start camera thread
threading.Thread(target=camera_loop, daemon=True).start()


# ==============================
# WebSocket Handler
# ==============================

async def handler(websocket):
    print("Client connected")

    try:
        while True:
            await asyncio.sleep(0.03)

            with lock:
                data = latest_metrics.copy()

            await websocket.send(json.dumps(data))

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")


# ==============================
# Start Server
# ==============================

async def main():
    async with websockets.serve(handler, "127.0.0.1", 8000):
        print("WebSocket running on ws://127.0.0.1:8000")
        await asyncio.Future()


asyncio.run(main())

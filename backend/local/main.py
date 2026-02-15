import cv2
import numpy as np
import mediapipe as mp
import time
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from lib.focus_metrics import FocusMetrics


# ------------------ Load Model ------------------

base_options = python.BaseOptions(model_asset_path="face_landmarker.task")

options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1
)

detector = vision.FaceLandmarker.create_from_options(options)


# ------------------ Head Pose Model ------------------

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


# ------------------ Init ------------------

metrics = FocusMetrics()
cap = cv2.VideoCapture(0)

# Increase capture resolution
# cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
# cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# cv2.namedWindow("Advanced Focus Detection System", cv2.WINDOW_NORMAL)
# cv2.resizeWindow("Advanced Focus Detection System", 1280, 600)

prev_time = 0


while True:
    ret, frame = cap.read()
    if not ret:
        break

    h, w, _ = frame.shape

    # FPS
    current_time = time.time()
    fps = 1 / (current_time - prev_time) if prev_time != 0 else 0
    prev_time = current_time

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

    result = detector.detect(mp_image)

    yaw = pitch = roll = None
    values = {}

    if result.face_landmarks:
        for face_landmarks in result.face_landmarks:

            landmarks = face_landmarks

            # -------- Head Pose --------

            image_points = np.array([
                (landmarks[NOSE].x * w, landmarks[NOSE].y * h),
                (landmarks[CHIN].x * w, landmarks[CHIN].y * h),
                (landmarks[LEFT_EYE_CORNER].x * w, landmarks[LEFT_EYE_CORNER].y * h),
                (landmarks[RIGHT_EYE_CORNER].x * w, landmarks[RIGHT_EYE_CORNER].y * h),
                (landmarks[LEFT_MOUTH].x * w, landmarks[LEFT_MOUTH].y * h),
                (landmarks[RIGHT_MOUTH].x * w, landmarks[RIGHT_MOUTH].y * h),
            ], dtype="double")

            focal_length = w
            center = (w / 2, h / 2)

            camera_matrix = np.array([
                [focal_length, 0, center[0]],
                [0, focal_length, center[1]],
                [0, 0, 1]
            ], dtype="double")

            dist_coeffs = np.zeros((4, 1))

            success, rotation_vector, translation_vector = cv2.solvePnP(
                model_points,
                image_points,
                camera_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_ITERATIVE
            )

            rmat, _ = cv2.Rodrigues(rotation_vector)
            angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

            pitch = angles[0]
            yaw = angles[1]
            roll = angles[2]

            # -------- Compute Metrics --------

            values = metrics.compute(
                landmarks,
                w,
                h,
                yaw=yaw,
                pitch=pitch,
                roll=roll
            )

            # -------- Draw Landmarks --------
            for lm in landmarks:
                x = int(lm.x * w)
                y = int(lm.y * h)
                cv2.circle(frame, (x, y), 1, (0, 255, 0), -1)

    # ------------------ DISPLAY METRICS ------------------

    y_offset = 30
    line_height = 22

    # Title
    cv2.putText(
        frame,
        "FOCUS METRICS",
        (20, 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,   # smaller
        (0, 255, 255),
        2
    )

    # FPS
    cv2.putText(
        frame,
        f"FPS: {int(fps)}",
        (w - 120, 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 0),
        2
    )

    y_offset = 60

    for key, value in values.items():

        if isinstance(value, float):
            text = f"{key}: {value:.3f}"
        else:
            text = f"{key}: {value}"

        cv2.putText(
            frame,
            text,
            (20, y_offset),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,   # smaller font
            (0, 255, 0),
            1
        )

        y_offset += line_height

    # ------------------ Show ------------------

    cv2.imshow("Advanced Focus Detection System", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break


cap.release()
cv2.destroyAllWindows()

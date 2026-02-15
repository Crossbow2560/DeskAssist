import numpy as np

# ---------- Utility ----------

def to_pixel(lm, w, h):
    return np.array([int(lm.x * w), int(lm.y * h)])

def dist(p1, p2):
    return np.linalg.norm(p1 - p2)

# ---------- Landmark Indices ----------

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

LEFT_IRIS = [468, 469, 470, 471]

LEFT_INNER_BROW = 70
RIGHT_INNER_BROW = 300
LEFT_BROW_TOP = 105
LEFT_EYE_TOP = 159

UPPER_LIP = 13
LOWER_LIP = 14
LEFT_MOUTH = 78
RIGHT_MOUTH = 308

NOSE = 1


# ---------- Core Calculation ----------

class FocusMetrics:
    def __init__(self):
        self.prev_EAR = None
        self.prev_MAR = None
        self.prev_gaze = None
        self.prev_yaw = None
        self.prev_pitch = None
        self.blink_frames = 0
        self.blink_count = 0

    # ----- EAR -----
    def eye_aspect_ratio(self, landmarks, eye_indices, w, h):
        pts = [to_pixel(landmarks[i], w, h) for i in eye_indices]

        A = dist(pts[1], pts[5])
        B = dist(pts[2], pts[4])
        C = dist(pts[0], pts[3])

        return (A + B) / (2.0 * C)

    # ----- Main Compute -----
    def compute(self, landmarks, w, h, yaw=None, pitch=None, roll=None):

        results = {}

        # ---- EAR ----
        EAR_left = self.eye_aspect_ratio(landmarks, LEFT_EYE, w, h)
        EAR_right = self.eye_aspect_ratio(landmarks, RIGHT_EYE, w, h)
        EAR_avg = (EAR_left + EAR_right) / 2
        results["EAR"] = EAR_avg

        # Blink detection
        if EAR_avg < 0.18:
            self.blink_frames += 1
        else:
            if self.blink_frames > 2:
                self.blink_count += 1
            self.blink_frames = 0

        results["blink_count"] = self.blink_count

        # ---- Gaze Stability ----
        eye_pts = [to_pixel(landmarks[i], w, h) for i in LEFT_EYE]
        iris_pts = [to_pixel(landmarks[i], w, h) for i in LEFT_IRIS]

        eye_center = np.mean(eye_pts, axis=0)
        iris_center = np.mean(iris_pts, axis=0)

        gaze_vector = iris_center - eye_center

        if self.prev_gaze is None:
            gaze_shift = 0
        else:
            gaze_shift = np.linalg.norm(gaze_vector - self.prev_gaze)

        self.prev_gaze = gaze_vector
        results["gaze_shift"] = gaze_shift

        # ---- Brow Furrow ----
        left_brow = to_pixel(landmarks[LEFT_INNER_BROW], w, h)
        right_brow = to_pixel(landmarks[RIGHT_INNER_BROW], w, h)

        brow_distance = dist(left_brow, right_brow)
        eye_width = dist(
            to_pixel(landmarks[33], w, h),
            to_pixel(landmarks[263], w, h)
        )

        results["brow_ratio"] = brow_distance / eye_width

        # ---- Brow Lowering ----
        brow_eye_dist = dist(
            to_pixel(landmarks[LEFT_BROW_TOP], w, h),
            to_pixel(landmarks[LEFT_EYE_TOP], w, h)
        )

        results["brow_lower_ratio"] = brow_eye_dist / eye_width

        # ---- Mouth ----
        upper = to_pixel(landmarks[UPPER_LIP], w, h)
        lower = to_pixel(landmarks[LOWER_LIP], w, h)
        left = to_pixel(landmarks[LEFT_MOUTH], w, h)
        right = to_pixel(landmarks[RIGHT_MOUTH], w, h)

        vertical = dist(upper, lower)
        horizontal = dist(left, right)

        MAR = vertical / horizontal
        results["MAR"] = MAR

        if self.prev_MAR is None:
            mouth_velocity = 0
        else:
            mouth_velocity = abs(MAR - self.prev_MAR)

        self.prev_MAR = MAR
        results["mouth_velocity"] = mouth_velocity

        # ---- Forward Lean ----
        nose_z = landmarks[NOSE].z
        results["nose_z"] = nose_z

        # ---- Head Motion ----
        if yaw is not None and pitch is not None:
            if self.prev_yaw is None:
                angular_velocity = 0
            else:
                angular_velocity = np.linalg.norm(
                    np.array([yaw, pitch]) -
                    np.array([self.prev_yaw, self.prev_pitch])
                )

            self.prev_yaw = yaw
            self.prev_pitch = pitch

            results["angular_velocity"] = angular_velocity
            results["roll"] = roll

        return results

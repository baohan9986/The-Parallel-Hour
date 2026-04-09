#include <ESP32Encoder.h>

ESP32Encoder encoder;

// 引脚
const int PIN_A = 35;
const int PIN_B = 34;

// 满量程计数
const long FULL_COUNTS = 21450;

// 50cm = 500mm
const float FULL_MM = 500.0;
const float MM_PER_COUNT = FULL_MM / (float)FULL_COUNTS;

// 平滑
const float ALPHA = 0.20;

// 自动归零
const unsigned long SOFT_RESET_INTERVAL = 1000;
const float RESET_WINDOW_MM = 5.0;

long zeroOffset = 0;
float smoothCounts = 0;

unsigned long lastCheckTime = 0;

long clampLong(long v, long lo, long hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

void setup() {
  Serial.begin(115200);
  delay(300);

  encoder.attachFullQuad(PIN_A, PIN_B);

  delay(200);

  zeroOffset = encoder.getCount();
  smoothCounts = 0;
}

void loop() {

  long raw = encoder.getCount() - zeroOffset;
  raw = clampLong(raw, 0, FULL_COUNTS);

  smoothCounts = smoothCounts + ALPHA * ((float)raw - smoothCounts);

  float mm = smoothCounts * MM_PER_COUNT;

  // ===== 自动归零 =====
  if (millis() - lastCheckTime > SOFT_RESET_INTERVAL) {
    lastCheckTime = millis();

    if (mm <= RESET_WINDOW_MM) {
      zeroOffset = encoder.getCount();
      smoothCounts = 0;
    }
  }

  // 🎯 只输出 0 - 500.00
  Serial.println(mm, 2);

  delay(10);
}

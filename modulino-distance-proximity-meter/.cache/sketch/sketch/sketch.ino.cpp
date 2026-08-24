#include <Arduino.h>
#line 1 "/home/arduino/ArduinoApps/Modulino-AppLab-example-pacakge/modulino-distance-proximity-meter/sketch/sketch.ino"
// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>
#include <math.h>

ModulinoDistance distance;

#line 11 "/home/arduino/ArduinoApps/Modulino-AppLab-example-pacakge/modulino-distance-proximity-meter/sketch/sketch.ino"
String buildState(int dist_mm, int in_range);
#line 16 "/home/arduino/ArduinoApps/Modulino-AppLab-example-pacakge/modulino-distance-proximity-meter/sketch/sketch.ino"
String rpc_get_state();
#line 24 "/home/arduino/ArduinoApps/Modulino-AppLab-example-pacakge/modulino-distance-proximity-meter/sketch/sketch.ino"
void setup();
#line 32 "/home/arduino/ArduinoApps/Modulino-AppLab-example-pacakge/modulino-distance-proximity-meter/sketch/sketch.ino"
void loop();
#line 11 "/home/arduino/ArduinoApps/Modulino-AppLab-example-pacakge/modulino-distance-proximity-meter/sketch/sketch.ino"
String buildState(int dist_mm, int in_range) {
  return "{\"distance_mm\": " + String(dist_mm) +
         ", \"in_range\": "   + String(in_range) + "}";
}

String rpc_get_state() {
  distance.available();
  float val = distance.get();
  int in_range = isnan(val) ? 0 : 1;
  int dist_mm  = in_range ? (int)val : 0;
  return buildState(dist_mm, in_range);
}

void setup() {
  Bridge.begin();
  Modulino.begin();
  distance.begin();

  Bridge.provide("get_state", rpc_get_state);
}

void loop() {
  if (distance.available()) {
    float val    = distance.get();
    int in_range = isnan(val) ? 0 : 1;
    int dist_mm  = in_range ? (int)val : 0;
    Bridge.notify("distance_reading", dist_mm, in_range);
  }
}


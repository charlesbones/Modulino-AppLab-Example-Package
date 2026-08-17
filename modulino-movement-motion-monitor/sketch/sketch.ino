// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>

ModulinoMovement imu;

unsigned long last_read_ms = 0;
const unsigned long READ_INTERVAL_MS = 100;

String buildState() {
  imu.update();
  return "{\"ax\": " + String(imu.getX(), 2) +
         ", \"ay\": " + String(imu.getY(), 2) +
         ", \"az\": " + String(imu.getZ(), 2) +
         ", \"gx\": " + String(imu.getRoll(), 2) +
         ", \"gy\": " + String(imu.getPitch(), 2) +
         ", \"gz\": " + String(imu.getYaw(), 2) + "}";
}

String rpc_get_state() {
  return buildState();
}

void setup() {
  Bridge.begin();
  Modulino.begin();
  imu.begin();

  Bridge.provide("get_state", rpc_get_state);
}

void loop() {
  unsigned long now = millis();
  if (now - last_read_ms >= READ_INTERVAL_MS) {
    last_read_ms = now;
    imu.update();
    Bridge.notify("motion_reading",
                  imu.getX(), imu.getY(), imu.getZ(),
                  imu.getRoll(), imu.getPitch(), imu.getYaw());
  }
}

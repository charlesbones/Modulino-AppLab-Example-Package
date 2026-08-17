// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>

ModulinoThermo thermo;

unsigned long last_read_ms = 0;
const unsigned long READ_INTERVAL_MS = 2000;

String buildState() {
  float temp = thermo.getTemperature();
  float hum  = thermo.getHumidity();
  return "{\"temperature\": " + String(temp, 1) +
         ", \"humidity\": "   + String(hum,  1) + "}";
}

String rpc_get_state() {
  return buildState();
}

void setup() {
  Bridge.begin();
  Modulino.begin();
  thermo.begin();

  Bridge.provide("get_state", rpc_get_state);
}

void loop() {
  unsigned long now = millis();
  if (now - last_read_ms >= READ_INTERVAL_MS) {
    last_read_ms = now;
    Bridge.notify("sensor_reading", thermo.getTemperature(), thermo.getHumidity());
  }
}

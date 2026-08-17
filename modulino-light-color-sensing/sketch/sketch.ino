// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>

ModulinoLight light;

String rpc_get_light() {
  light.update();

  // ModulinoColor stores r/g/b privately; extract via its uint32_t cast:
  // operator uint32_t() returns (b << 8 | g << 16 | r << 24)
  uint32_t raw = (uint32_t)light.getColor();
  int r = (raw >> 24) & 0xFF;
  int g = (raw >> 16) & 0xFF;
  int b = (raw >> 8) & 0xFF;

  String colorName = light.getColorApproximate();
  int lux    = light.getLux();
  int rawLux = light.getAL();
  int ir     = light.getIR();

  String json = "{";
  json += "\"lux\":"        + String(lux)      + ",";
  json += "\"raw_lux\":"    + String(rawLux)    + ",";
  json += "\"ir\":"         + String(ir)        + ",";
  json += "\"r\":"          + String(r)         + ",";
  json += "\"g\":"          + String(g)         + ",";
  json += "\"b\":"          + String(b)         + ",";
  json += "\"color_name\":\"" + colorName + "\"";
  json += "}";

  return json;
}

void setup() {
  Bridge.begin();
  Modulino.begin();
  light.begin();
  Bridge.provide("get_light", rpc_get_light);
}

void loop() {
  // Bridge handles RPC in a background thread; nothing needed here.
}

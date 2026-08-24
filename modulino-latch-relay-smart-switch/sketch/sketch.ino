// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>

ModulinoLatchRelay relay;

// Track state explicitly — getStatus() polled immediately after a coil
// pulse may return a stale value before the hardware confirms the switch.
int relay_status = -1;

String buildState(int status) {
  return "{\"status\": " + String(status) + "}";
}

String rpc_get_state() {
  relay_status = relay.getStatus();
  return buildState(relay_status);
}

String rpc_relay_on() {
  relay.set();
  relay_status = 1;
  return buildState(relay_status);
}

String rpc_relay_off() {
  relay.reset();
  relay_status = 0;
  return buildState(relay_status);
}

void setup() {
  Bridge.begin();
  Modulino.begin();
  relay.begin();

  // Latching relays retain their last state across power cycles, so force
  // it off at boot regardless of how it was left — starting energized would
  // be a safety hazard for whatever load is wired to it.
  relay.reset();
  relay_status = 0;

  Bridge.provide("get_state", rpc_get_state);
  Bridge.provide("relay_on",  rpc_relay_on);
  Bridge.provide("relay_off", rpc_relay_off);
}

void loop() {
}

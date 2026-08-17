// SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
//
// SPDX-License-Identifier: MPL-2.0

/*
 * Modulino Buttons — Interactive Panel
 *
 * Uses the Button2 library to detect press, release, and double-tap events
 * on all 3 Modulino Buttons (A, B, C). Events are pushed to Python via
 * Bridge.notify(). Each button's onboard orange LED can be toggled
 * independently from the browser using the "set_led" Bridge function.
 *
 * Hardware: Arduino UNO Q + Modulino Buttons (Qwiic)
 */

#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>
#include <Button2.h>

// ── Modulino + Button2 objects ───────────────────────────────────
ModulinoButtons modulinoButtons;
Button2 btn[3];

// ── LED state (index 0 = A, 1 = B, 2 = C) ───────────────────────
bool ledState[3] = {false, false, false};

// ── Helper: apply current ledState[] to the hardware ────────────
void applyLeds() {
  modulinoButtons.setLeds(ledState[0], ledState[1], ledState[2]);
}

// ── Bridge callback: set one LED from Python ─────────────────────
// Python sends: set_led(index, state)
//   index : 0 (A), 1 (B), or 2 (C)
//   state : 1 = on, 0 = off
String rpc_set_led(int index, int newState) {
  if (index < 0 || index > 2) return "{\"ok\":false}";
  ledState[index] = (newState != 0);
  applyLeds();
  return "{\"ok\":true}";
}

// ── Button2 state handlers (one per button) ──────────────────────
// Button2 polls these to read button state.
// Returns LOW when pressed, HIGH when released (pull-up convention).
uint8_t btn0State() { modulinoButtons.update(); return modulinoButtons.isPressed(0) ? LOW : HIGH; }
uint8_t btn1State() { modulinoButtons.update(); return modulinoButtons.isPressed(1) ? LOW : HIGH; }
uint8_t btn2State() { modulinoButtons.update(); return modulinoButtons.isPressed(2) ? LOW : HIGH; }

// ── Helper: resolve which button index triggered the event ───────
int btnIndex(Button2& b) {
  for (int i = 0; i < 3; i++) if (&b == &btn[i]) return i;
  return -1;
}

// ── Button2 event handlers ───────────────────────────────────────
void onPress(Button2& b) {
  int i = btnIndex(b);
  if (i >= 0) Bridge.notify("button_event", i, "press");
}

void onRelease(Button2& b) {
  int i = btnIndex(b);
  if (i >= 0) Bridge.notify("button_event", i, "release");
}

void onDoubleClick(Button2& b) {
  int i = btnIndex(b);
  if (i >= 0) Bridge.notify("button_event", i, "double_tap");
}

void setup() {
  Bridge.begin();   // connect to Python first
  Modulino.begin();
  modulinoButtons.begin();

  // Make sure all LEDs start off
  applyLeds();

  // Configure Button2 for each of the 3 buttons
  typedef uint8_t (*StateFunc)();
  StateFunc stateFuncs[3] = {btn0State, btn1State, btn2State};

  for (int i = 0; i < 3; i++) {
    btn[i].setDebounceTime(35);
    btn[i].setButtonStateFunction(stateFuncs[i]);
    btn[i].setPressedHandler(onPress);
    btn[i].setReleasedHandler(onRelease);
    btn[i].setDoubleClickHandler(onDoubleClick);
    btn[i].begin(BTN_VIRTUAL_PIN);
  }

  // Expose "set_led" so Python can call it from the Web UI
  Bridge.provide("set_led", rpc_set_led);
}

void loop() {
  // Let Button2 process all button state machines
  for (int i = 0; i < 3; i++) {
    btn[i].loop();
  }
}

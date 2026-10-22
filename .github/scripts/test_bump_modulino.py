from bump_modulino import latest_versions, pins_for_modulino, rewrite

index = {"libraries": [
    {"name": "Arduino_Modulino", "version": "0.9.0", "dependencies": [{"name": "Dep"}]},
    {"name": "Arduino_Modulino", "version": "0.10.0", "dependencies": [{"name": "Dep"}, {"name": "New"}]},
    {"name": "Arduino_Modulino", "version": "0.11.0-rc1"},
    {"name": "Dep", "version": "1.0.0"},
    {"name": "Dep", "version": "1.2.0"},
    {"name": "New", "version": "0.5.3"},
]}
pins = pins_for_modulino(latest_versions(index))
assert pins == {"Arduino_Modulino": "0.10.0", "Dep": "1.2.0", "New": "0.5.3"}, pins

before = """    libraries:
      - dependency: Other (1.0.0)
      - dependency: Dep (1.0.0)
      - Arduino_Modulino (0.9.0)
      - Button2 (2.5.0)
"""
after = """    libraries:
      - dependency: Other (1.0.0)
      - dependency: Dep (1.2.0)
      - Arduino_Modulino (0.10.0)
      - dependency: New (0.5.3)
      - Button2 (2.5.0)
"""
assert rewrite(before, pins) == after, rewrite(before, pins)
assert rewrite(after, pins) == after  # idempotent
assert rewrite("libraries:\n  - Foo (1.0)\n", pins) == "libraries:\n  - Foo (1.0)\n"  # no Modulino: untouched
print("ok")

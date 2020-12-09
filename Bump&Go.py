#!/usr/bin/env python3

from time import sleep

from ev3dev2.motor import LargeMotor, OUTPUT_A, OUTPUT_B, SpeedPercent, MoveTank
from ev3dev2.sensor import INPUT_1
from ev3dev2.sensor.lego import TouchSensor
from ev3dev2.led import Leds

ts = TouchSensor()
leds = Leds()
tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)

print("Bump and go!")

while True:
    if ts.is_pressed:
        tank_drive.on_for_rotations(SpeedPercent(-50), SpeedPercent(-75), 10)
    else:
        tank_drive.on(SpeedPercent(30), SpeedPercent(30))
    # don't let this loop use 100% CPU
    sleep(0.01)

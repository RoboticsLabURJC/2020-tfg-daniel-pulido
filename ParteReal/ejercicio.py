#!/usr/bin/env python3

from time import sleep

from ev3dev2.motor import LargeMotor, OUTPUT_A, OUTPUT_B, SpeedPercent, MoveTank
from ev3dev2.sensor import INPUT_1
from ev3dev2.sensor.lego import ColorSensor
from ev3dev2.led import Leds

cs = ColorSensor()
leds = Leds()
tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)


print("Siguelineas!")

while True:
    # print(cs.reflected_light_intensity)
    if cs.reflected_light_intensity>15:
        while cs.reflected_light_intensity>15:
            tank_drive.on(SpeedPercent(0), SpeedPercent(15))
    else:
        tank_drive.on(SpeedPercent(15), SpeedPercent(0))
    # don't let this loop use 100% CPU
    sleep(0.02)

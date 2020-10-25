#!/usr/bin/env python3


from time import sleep
from ev3dev2 import list_devices
from ev3dev2.port import LegoPort
from ev3dev2.motor import OUTPUT_A, LargeMotor, SpeedPercent
from ev3dev2.sensor import INPUT_1
from ev3dev2.sensor.lego import UltrasonicSensor

p1 = LegoPort(INPUT_1)
p1.mode = 'ev3-uart'
p1.set_device = 'lego-ev3-us'


sleep(0.5)

s = UltrasonicSensor(INPUT_1)
m = LargeMotor(OUTPUT_A)

print("Running motor...")

while True:
    dist = s.distance_centimeters
    if dist < 50:
        m.on(SpeedPercent(30))
    else:
        m.on(SpeedPercent(-30))

    sleep(0.05)

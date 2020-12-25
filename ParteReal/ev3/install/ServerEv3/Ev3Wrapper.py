import ev3dev2.motor
from ev3dev2.sensor import INPUT_1, INPUT_2, INPUT_3, INPUT_4
import ev3dev2.sensor.lego
import time


class Ev3Wrapper:

    def __init__(self,
                 left_motor_port=OUTPUT_D,
                 right_motor_port=OUTPUT_A):


      # Esto puede dar error si no hay ninguno conectado, se podria implementar un try catch
        us= UltraSonic()
        to= TouchSensor()
        cs = ColorSensor()
        tank_drive = MoveTank(left_motor_port, right_motor_port)


    def TurnDegrees(self, degrees, speed):
        # get the starting position of each motor
        tank_drive.turn_degrees(self, speed, degrees)

    def avanzar(self, val):
        tank_drive.on(self,val, val)

    def retroceder(self, val):
        tank_drive.on(self,-val,-val)

    def girar_derecha(self, w):

        tank_drive.turn_right(self, 360, 2*3,1416/w)

    def girar_izquierda(self, w):

        tank_drive.turn_left(self, 360, 2*3,1416/w)

    def avanzar_hasta(self, distance):
        dist_mm = distance * 1000

        # the number of degrees each wheel needs to turn
        tank_drive.on_for_distance(self, 20, distance_mm, brake=True, block=True)

    def retroceder_hasta(self, distance):
        self.avanzar_hasta(-distance)

    def girar_derecha_hasta(self, degrees):
        self.TurnDegrees(degrees, 100)

    def girar_izquierda_hasta(self, degrees):
        self.TurnDegrees(-degrees, 100)

    def parar(self):
        tank_drive.odometry_stop()

    def getObjectColor(self, color):
        cs.color()

    def getDistance(self):
        us.distance_centimeters_continuous()

    def isTouching(self):
        to.is_pressed()


    def target_reached(self,left_target_degrees,right_target_degrees):
        tolerance = 5
        min_left_target = left_target_degrees - tolerance
        max_left_target = left_target_degrees + tolerance
        min_right_target = right_target_degrees - tolerance
        max_right_target = right_target_degrees + tolerance

        current_left_position = left_motor_port.position()
        current_right_position = right_motor_port.position()

        if current_left_position > min_left_target and \
           current_left_position < max_left_target and \
           current_right_position > min_right_target and \
           current_right_position < max_right_target:
            return True
        else:
            return False

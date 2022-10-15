#!/usr/bin/python3
# Inspired by:
# https://github.com/tatobari/hx711py
# Sample: https://github.com/tatobari/hx711py/blob/master/example.py

## Sensor common settings
## According to https://github.com/tatobari/hx711py/blob/master/example.py
## HOW TO CALCULATE THE REFFERENCE UNIT
## To set the reference unit to 1. Put 1kg on your sensor or anything you have and know exactly how much it weights.
## In this case, 92 is 1 gram because, with 1 as a reference unit I got numbers near 0 without any weight
## and I got numbers around 184000 when I added 2kg. So, according to the rule of thirds:
## If 2000 grams is 184000 then 1000 grams is 184000 / 2000 = 92.
referenceUnit = 1
EMULATE_HX711=False

BOARD_1_CK,BOARD_1_DT = 5,6
BOARD_2_CK,BOARD_2_DT = 27,22

# Estimate_params
A1p = [0.0020680475510323967,-7.459194297264942]
B1p = [0.008817193618583824,-4.63981885658602]
A2p = [0.0022655544150686335,-1.974251537515449]
B2p = [0.00875250101106832,-4.737330347555451]


import sys,time
from threading import Thread

time.sleep(15)

# sensor library init
if not EMULATE_HX711:
    import RPi.GPIO as GPIO
    from hx711 import HX711
else:
    from emulated_hx711 import HX711

def initSensor(pin_clock,pin_data):
    hx = HX711(pin_data,pin_clock)
    # According to https://github.com/tatobari/hx711py/blob/master/example.py
    # If you're experiencing super random values, change first value to LSB until to get more stable values.
    hx.set_reading_format("MSB", "MSB")
    hx.set_reference_unit(referenceUnit)

    hx.reset()

    # to use both channels, you'll need to tare them both
    hx.tare_A()
    hx.tare_B()

    return hx


def getSensorVal(hx):
    try:
        val_A = hx.get_weight_A(5)
        val_B = hx.get_weight_B(5)
        #print "A2: %s  B2: %s" % ( val_A2, val_B2 )

        hx.power_down()
        hx.power_up()
        #time.sleep(0.1)

        return val_A,val_B
    except (KeyboardInterrupt, SystemExit):
        #sensorCleanAndExit()
        return -1,-1

def sensorCleanAndExit():
    print("Cleaning...")

    if not EMULATE_HX711:
        GPIO.cleanup()
        
    print("Bye!")
    sys.exit()

hx1 = initSensor(BOARD_1_CK, BOARD_1_DT)
hx2 = initSensor(BOARD_2_CK, BOARD_2_DT)

# https://qiita.com/comachi/items/c494e0d6c6d1775a3748
# bleno / pybleno で Raspberry Pi を BLE Peripheral として動かしてみる

from pybleno import *

bleno = Bleno()

APPROACH_SERVICE_UUID = '9D4B0A98-27C0-4D28-8481-C49A64DF22A5'
APPROACH_CHARACTERISTIC_UUID = 'B665242B-1F1F-4122-AB17-F9EF0805ADC8'
#APPROACH_SERVICE_UUID = '13A28130-8883-49A8-8BDB-42BC1A7107F4'
#APPROACH_CHARACTERISTIC_UUID = 'A2935077-201F-44EB-82E8-10CC02AD8CE1'


class ApproachCharacteristic(Characteristic):

    def __init__(self):
        Characteristic.__init__(self, {
            'uuid': APPROACH_CHARACTERISTIC_UUID,
            'properties': ['read', 'notify'],
            'value': None
        })

        self._value = str(0).encode()

        self._updateValueCallback = None

    def onReadRequest(self, offset, callback):
        print('ApproachCharacteristic - onReadRequest')
        callback(result=Characteristic.RESULT_SUCCESS, data=self._value)

    def onSubscribe(self, maxValueSize, updateValueCallback):
        print('ApproachCharacteristic - onSubscribe')

        self._updateValueCallback = updateValueCallback

    def onUnsubscribe(self):
        print('ApproachCharacteristic - onUnsubscribe')

        self._updateValueCallback = None


def onStateChange(state):
    print('on -> stateChange: ' + state)

    if (state == 'poweredOn'):
        bleno.startAdvertising(name='Approach', service_uuids=[APPROACH_SERVICE_UUID])
    else:
        bleno.stopAdvertising()


bleno.on('stateChange', onStateChange)

approachCharacteristic = ApproachCharacteristic()


def onAdvertisingStart(error):
    print('on -> advertisingStart: ' + ('error ' + error if error else 'success'))

    if not error:
        bleno.setServices([
            BlenoPrimaryService({
                'uuid': APPROACH_SERVICE_UUID,
                'characteristics': [
                    approachCharacteristic
                ]
            })
        ])


bleno.on('advertisingStart', onAdvertisingStart)

bleno.start()

def accessSensor():
    global sensorLog
    while True:
      #print('New sensor vals..', end='')
      try:
        s1A,s1B = getSensorVal(hx1)
        s2A,s2B = getSensorVal(hx2)
        print("Sensor value: A1: %s  B1: %s  A2: %s  B2: %s" % ( s1A, s1B, s2A, s2B ))
        g1,g2,g3,g4 = A1p[0]*s1A+A1p[1], B1p[0]*s1B+B1p[1], A2p[0]*s2A+A2p[1], B2p[0]*s2B+B2p[1]
        #print("Total: %dg  A1: %dg  B1: %dg  A2: %dg  B2: %dg " % ( int(g1+g2+g3+g4),int(g1),int(g2),int(g3),int(g4)) )

        #newLog ="[%d,%f,%f,%f,%f,%f]" % ( time.time(),g1+g2+g3+g4,g1,g2,g3,g4)
        #sensorLog.append(newLog)


        approachCharacteristic._value = ("%d,%d,%d,%d"%(s1A,s1B,s2A,s2B)).encode()
        #approachCharacteristic._value = str(int(g1+g2+g3+g4)).encode()
        if approachCharacteristic._updateValueCallback:

            #print('Sending notification with value : ' + str(approachCharacteristic._value))

            notificationBytes = approachCharacteristic._value
            #notificationBytes = str(approachCharacteristic._value).encode()
            approachCharacteristic._updateValueCallback(data=notificationBytes)

        time.sleep(0.1)
      except (KeyboardInterrupt, SystemExit):
        print("")
        sensorCleanAndExit()

#thr = Thread(target=accessSensor,args=(target_time,))
thr = Thread(target=accessSensor)
#const thr = Thread(target=accessSensor,args=(hx1))
thr.start()

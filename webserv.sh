#!/usr/bin/python3

# Inspired by:
# https://github.com/tatobari/hx711py
# Sample: https://github.com/tatobari/hx711py/blob/master/example.py

# Settings:

## webAPI port name
PORT_NUM=8080

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


# The code below
import sys, argparse, json, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
#from urllib.parse import parse_qs
from threading import Thread
import socket
hostnam = socket.gethostname()+'.local'

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

#s1A,s1B,s2A,s2B = -1,-1,-1,-1

sensorLog = []
def accessSensor():
    global sensorLog
    while True:
      print('New sensor vals..', end='')
      try:
        s1A,s1B = getSensorVal(hx1)
        s2A,s2B = getSensorVal(hx2)
        #print("Sensor value: A1: %s  B1: %s  A2: %s  B2: %s" % ( s1A, s1B, s2A, s2B ))
        g1,g2,g3,g4 = A1p[0]*s1A+A1p[1], B1p[0]*s1B+B1p[1], A2p[0]*s2A+A2p[1], B2p[0]*s2B+B2p[1]
        print("Total: %dg  A1: %dg  B1: %dg  A2: %dg  B2: %dg " % ( int(g1+g2+g3+g4),int(g1),int(g2),int(g3),int(g4)) )
        newLog ="[%d,%f,%f,%f,%f,%f]" % ( time.time(),g1+g2+g3+g4,g1,g2,g3,g4)
        sensorLog.append(newLog)

        time.sleep(0.1)
      except (KeyboardInterrupt, SystemExit):
        print("")
        sensorCleanAndExit()

#thr = Thread(target=accessSensor,args=(target_time,))
thr = Thread(target=accessSensor)
#const thr = Thread(target=accessSensor,args=(hx1))
thr.start()

##############################################
###### JSONP API server setup
###### https://qiita.com/komorin0521/items/dfc02444a60180688e43
class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global sensorLog
        responseObjStr = '{}'
        try:
            #content_len=int(self.headers.get('content-length'))
            #requestBody = json.loads(self.rfile.read(content_len).decode('utf-8'))
            parsed = urlparse(self.path)

            #s1A,s1B = getSensorVal(hx1)
            #s2A,s2B = getSensorVal(hx2)
            log = sensorLog
            sensorLog = []

            log = ",".join( log )


            responseObjStr = '{"sensorlog":[%s]}' % log

        except Exception as e:

            print("An error occured")
            print("The information of error is as following")
            print(type(e))
            print(e.args)
            print(e)

            responseObjStr='{"error":"%s","expected_response":"%s"}' % (json.dumps(e),responseObjStr)

        self.send_response(200)
        #self.send_header('Content-type', 'application/x-javascript')
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # JSONP support
        if parsed.query.startswith("callback="):
            responseObjStr = parsed.query[9:]+('(%s)' % responseObjStr)

        self.wfile.write(responseObjStr.encode('utf-8'))

def run(server_class=HTTPServer, handler_class=MyHandler, port=PORT_NUM):
    print('===========');
    print('Starting API server at port '+str(port));
    print('To change the port, supply: -P [port num]');
    print('Access sample: curl http://%s:%d' % (hostnam,port));
    print('For JSONP access, add "callback" param as: curl "http://%s:%d?callback=abcde"' % (hostnam,port));

    server = server_class(('', port), handler_class)

    try :
        server.serve_forever()
    except KeyboardInterrupt:
        #pass
        sensorCleanAndExit()

def importargs():
    parser = argparse.ArgumentParser("This is the simple server")

    parser.add_argument('--port', '-P', required=False, type=int, default=PORT_NUM)

    args = parser.parse_args()

    return args.port


def main():
    port = importargs()

    run(port=port)

if __name__ == '__main__':
    main()

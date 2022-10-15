# Dual HX711 Server for RasPi, accessible by JSONP

## Hardware connection

Connect two HX711 boards to RasPi GPIO pins. The connected pin numbers should be written in ble.sh & webserv.py

~~~python:ble.sh, webserv.py
BOARD_1_CK, BOARD_1_DT = 5,6
BOARD_2_CK, BOARD_2_DT = 27,22
~~~

## Install / Run (BLE version)

1. install necessary libs

~~~bash
sudo pip3 install pybleno
~~~

2. run

~~~bash
$ sudo ./ble.sh
~~~

3. Access

[https://sowd.github.io/kait-hx711/](https://sowd.github.io/kait-hx711/)

4. Autorun

```
$ sudo crontab -e
```

then add the following line.

```
@reboot /home/pi/kait-hx711/ble.sh
```

## Install / Run (HTTP version)

1. install necessary libs

~~~bash
$ python3 setup.py install
~~~

2. run

~~~bash
$ ./webserv.sh
~~~

3. Access

Default port is 8080. If you want to modify, supply -P option.

~~~bash
curl http://hostname:8080
~~~
JSONP
~~~bash
curl "http://hostname:8080?callback=abcdefg"
~~~

4. Autorun

```
$ crontab -e
```

then add the following line.

```
@reboot /home/pi/kait-hx711/webserv.sh
```
## Calibrate

calibrate-estimate.js eEstimates raw value -> gram mapping by Gram = a * RawValue + b 
using least square fitting


## References

+ [Tatobari's hx711py repo](https://github.com/tatobari/hx711py)
+ [bleno / pybleno で Raspberry Pi を BLE Peripheral として動かしてみる
](https://qiita.com/comachi/items/c494e0d6c6d1775a3748)
+ [WebブラウザからBLE接続 WEB Bluetooth APIでNotificationを受け取る方法](https://masato-ka.hatenablog.com/entry/2017/09/24/151251).

<hr /><hr /><hr />

The original README of [Tatobari's hx711py repo](https://github.com/tatobari/hx711py) follows.

# HX711 for Raspbery Py

Quick code credited to [underdoeg](https://github.com/underdoeg/)'s [Gist HX711.py](https://gist.github.com/underdoeg/98a38b54f889fce2b237).
I've only made a few modifications on the way the captured bits are processed and to support Two's Complement, which it didn't.

Update: 25/02/2021
----
For the past years I haven't been able to maintain this library because I had too much workload. Now I'm back and I've been working on a few fixes and modifications to simplify this library, and I might be commiting the branch by mid-March. I will also publish it to PIP.

Instructions
------------
Check example.py to see how it works.

Installation
------------
1. Clone or download and unpack this repository
2. In the repository directory, run
```
python setup.py install
```

Using a 2-channel HX711 module
------------------------------
Channel A has selectable gain of 128 or 64.  Using set_gain(128) or set_gain(64)
selects channel A with the specified gain.

Using set_gain(32) selects channel B at the fixed gain of 32.  The tare_B(),
get_value_B() and get_weight_B() functions do this for you.

This info was obtained from an HX711 datasheet located at
https://cdn.sparkfun.com/datasheets/Sensors/ForceFlex/hx711_english.pdf


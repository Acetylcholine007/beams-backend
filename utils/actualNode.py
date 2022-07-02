from datetime import datetime, timezone
from statistics import mean
from scipy.fftpack import fft
import numpy as np
import time
import threading
import concurrent.futures
import requests
import json
import pytz
import smbus

#some MPU6050 Registers and their Address
PWR_MGMT_1   = 0x6B
SMPLRT_DIV   = 0x19
CONFIG       = 0x1A
GYRO_CONFIG  = 0x1B
INT_ENABLE   = 0x38
ACCEL_XOUT_H = 0x3B
ACCEL_YOUT_H = 0x3D
ACCEL_ZOUT_H = 0x3F
GYRO_XOUT_H  = 0x43
GYRO_YOUT_H  = 0x45
GYRO_ZOUT_H  = 0x47


def MPU_Init():
	#write to sample rate register
	bus.write_byte_data(Device_Address, SMPLRT_DIV, 7)
	
	#Write to power management register
	bus.write_byte_data(Device_Address, PWR_MGMT_1, 1)
	
	#Write to Configuration register
	bus.write_byte_data(Device_Address, CONFIG, 0)
	
	#Write to Gyro configuration register
	bus.write_byte_data(Device_Address, GYRO_CONFIG, 24)
	
	#Write to interrupt enable register
	bus.write_byte_data(Device_Address, INT_ENABLE, 1)

def read_raw_data(addr):
	#Accelero and Gyro value are 16-bit
        high = bus.read_byte_data(Device_Address, addr)
        low = bus.read_byte_data(Device_Address, addr+1)
    
        #concatenate higher and lower value
        value = ((high << 8) | low)
        
        #to get signed value from mpu6050
        if(value > 32768):
                value = value - 65536
        return value/16384.0

def read_acceleration():
    return (read_raw_data(ACCEL_XOUT_H), read_raw_data(ACCEL_YOUT_H), read_raw_data(ACCEL_ZOUT_H))

bus = smbus.SMBus(1)
Device_Address = 0x68

MPU_Init()
PHI = pytz.timezone('Asia/Manila')
serialKey = "00000000"

def gather_data():

    ## Initialize hundred data storage
    array_ax = []
    array_ay = []
    array_az = []
    major_array = [] ## Storage of data in pattern [(ax,ay, az),(ax, ay, az)]

    while True:
        time.sleep(0.008)
        try:
            ax,ay,az = read_acceleration()
            date_time = str(datetime.now(
                timezone.utc).astimezone(PHI).isoformat())

            array_ax.append (ax)
            array_ay.append (ay)
            array_az.append (az)
            data_array = [ax,ay,az,date_time]
            major_array.append(data_array)

            length = len(array_ax)

            if (length == 100):
                max_x = max(array_ax)
                max_y = max(array_ay)
                max_z = max(array_ax)
                min_x = min(array_ax)
                min_y = min(array_ay)
                min_z = min(array_ax)

                ## The return boolean will determine whether the data will be sent to the data base or not
                
                return True, major_array, array_ax, array_ay, array_az 
                if (max_x >= 0.4 or max_y >= 0.4 or max_z >= 2 or min_x <= -0.4 or min_y <= -0.4 or min_z <= -2):
                    print ("Finish reading data...")
                    return True, major_array, array_ax, array_ay, array_az 

                else :
                    return False, major_array, array_ax, array_ay, array_az
                
        except OSError:
            print("Error occured on the program loosed connection between the raspi and the sensor")


## Function for the processing of data
## Preprocessing of data includes transformation of time domain data to a frequency domain data using FFT

def process_data(datax, datay, dataz):

    ## Initialize the variable to be used in preprocessing
    
    fx = []
    fy = []
    fz = []
    farray = []

    t = np.arange(0,1,1/100)
    samplesize = np.size(t)


    print ("Processing data...")
    dataProcessX, dataProcessY, dataProcessZ = datax, datay, dataz
    
    fr = (100/2)*np.linspace(0, 1, int(samplesize/2))

    X1 = fft(np.subtract(dataProcessX, mean(dataProcessX)))
    X_m1 = (2/samplesize)*abs(X1[0:np.size(fr)])

    Y2 = fft(np.subtract(dataProcessY, mean(dataProcessY)))
    Y_m1 = (2/samplesize)*abs(Y2[0:np.size(fr)])

    Z3 = fft(np.subtract(dataProcessZ, mean(dataProcessZ)))
    Z_m1 = (2/samplesize)*abs(Z3[0:np.size(fr)])
    

    for d in range (50):
        fx.append(X_m1[d])
        fy.append(Y_m1[d])
        fz.append(Z_m1[d])
        now = datetime.now()
        date = (now.strftime("%Y-%m-%d"))        
        
        farray.append([fx[d],fy[d],fz[d],date])

        if (len (farray) == 50):
            
            print ("Finish processing data...")
            return farray, fx, fy, fz


## Function for the sending data on the database
def send_data(raw_list, ax, ay, az, fft_list, fx, fy, fz, time_stamp):
    header = {"Content-type": "application/json"}
    body = {
        "serialKey": serialKey,
        "rawX": ax,
        "rawY": ay,
        "rawZ": az,
        "fftX": fx,
        "fftY": fy,
        "fftZ": fz,
        "rawDatetime": list(map(lambda item: item[3], raw_list)),
        "fftFrequency": list(map(lambda item: item[3], fft_list)),
        "datetime": time_stamp
    }

    try:
        print("Sending data...")
        # print(body)
        response = requests.post(
            f'https://project-beams.herokuapp.com/readings', data=json.dumps(body), headers=header)
        print(response.status_code)

    except Exception as e:
        # Save data to file if there is connection problem
        print("Problem with the connection on the server")
        print(e)
        write_raw_array = np.array(raw_list)
        write_pro_array = np.array(fft_list)
        with open("raw_data.csv", "a") as f:
            f.write(str(write_raw_array))
        with open("pro_data.csv", "a") as f:
            f.write(str(write_pro_array))
        

def main():
    while True:
        start_time = time.time()
        time_stamp = str(datetime.now(timezone.utc).astimezone(PHI).isoformat())
        thresh, rawList, ax, ay, az = gather_data()
        print (time.time() - start_time)

        if (thresh == True):
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(process_data, ax, ay, az)
                fftList, fx, fy, fz = future.result()
                send = threading.Thread(target=send_data, args=[
                                        rawList, ax, ay, az, fftList, fx, fy, fz, time_stamp])
                send.start()
                send.join()
                print (time.time() - start_time)
            
        else :
            print("Data do not passed the given threshold")
    

if __name__ == "__main__":
    main()

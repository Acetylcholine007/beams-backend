from mpu9250_jmdev.registers import *
from mpu9250_jmdev.mpu_9250 import MPU9250
from datetime import datetime, timezone
from statistics import mean
from scipy.fftpack import fft
import numpy as np
import time
import threading
import concurrent.futures
import requests
import json
import random
import pytz

PHI = pytz.timezone('Asia/Manila')
serialKey = "00000000"

mpu = MPU9250(
    address_ak=AK8963_ADDRESS, 
    address_mpu_master=MPU9050_ADDRESS_68, # In 0x68 Address
    address_mpu_slave=None, 
    bus=1, 
    gfs=GFS_1000, 
    afs=AFS_2G, 
    mfs=AK8963_BIT_16, 
    mode=AK8963_MODE_C100HZ)

##function for gathering data

def gather_data():

    ## Initialize hundred data storage
    array_ax = [] ## Storage for x-axis data
    array_ay = []
    array_az = []
    major_array = [] ## Storage of data in pattern [(ax,ay, az),(ax, ay, az)]

    while True:
        try:
            ax,ay,az = mpu.readAccelerometerMaster()
            now = datetime.now()
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
        
def send_data(raw_list, ax, ay, az, fft_list, fx, fy, fz):
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
        "datetime": str(datetime.now(timezone.utc).astimezone(PHI).isoformat())
    }

    try:
        print("Sending data...")
        print(body)
        response = requests.post(
            f'http://192.168.1.18:8000/test/postRead', data=json.dumps(body), headers=header)
        print(response.status_code)

    except Exception as e:
        # Save data to file if there is connection problem
        print("Problem with the connection on the server")
        print(e)
        write_raw_array = np.array(data_sent)
        write_pro_array = np.array(farray)
        with open("raw_data.csv", "a") as f:
            f.write(str(write_raw_array))
        with open("pro_data.csv", "a") as f:
            f.write(str(write_pro_array))
            


## Main function for the whole process
## Connection to database --> Data gathering --> Data Processing --> Data Sending

def main():
    while True:
        start_time = time.time()
        thresh, rawList, ax, ay, az = gather_data()

        if (thresh == True):
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(process_data, ax, ay, az)
                fftList, fx, fy, fz = future.result()
                send = threading.Thread(target=send_data, args=[
                                        rawList, ax, ay, az, fftList, fx, fy, fz])
                send.start()
                send.join()
                print (time.time() - start_time)
            
        else :
            print("Data do not passed the given threshold")
        break
    

if __name__ == "__main__":

    mpu.configure()
    mpu.calibrate()
    mpu.configure()
    abias = mpu.abias
    print (abias)
    main()

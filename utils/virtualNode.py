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

def dummy_sensor(x):
    p1f = 20
    p1mag = 25
    s1f = 15
    s1mag = 30
    p1 = p1mag * np.sin(2*np.pi*p1f * x)
    s1 = s1mag * np.sin(2*np.pi*s1f * x)

    p2f = 10
    p2mag = 25
    s2f = 6
    s2mag = 30
    p2 = p2mag * np.cos(2*np.pi*p2f * x)
    s2 = s2mag * np.cos(2*np.pi*s2f * x)

    p3f = 2
    p3mag = 30
    s3f = 5
    s3mag = 35
    p3 = p3mag * np.sin(2*np.pi*p3f * x)
    s3 = s3mag * np.sin(2*np.pi*s3f * x)

    # return (p1+s1, p2+s2, p3+s3)
    return (p1+s1+random.uniform(0.4, 2), p2+s2+random.uniform(0.4, 2), p3+s3+random.uniform(2, 4))

# function for gathering data


def gather_data():

    # Initialize hundred data storage
    array_ax = []  # Storage for x-axis data
    array_ay = []
    array_az = []
    major_array = []  # Storage of data in pattern [(ax,ay, az),(ax, ay, az)]
    x = 0

    while True:
        time.sleep(0.01)
        try:
            # ax,ay,az = mpu.readAccelerometerMaster()
            ax, ay, az = dummy_sensor(x)
            x += 0.01
            # now = datetime.now()
            # date_time = (now.strftime("%Y-%m-%d, %H:%M:%S"))
            date_time = str(datetime.now(
                timezone.utc).astimezone(PHI).isoformat())

            array_ax.append(ax)
            array_ay.append(ay)
            array_az.append(az)
            data_array = [ax, ay, az, date_time]
            major_array.append(data_array)

            length = len(array_ax)

            if (length == 100):
                max_x = max(array_ax)
                max_y = max(array_ay)
                max_z = max(array_ax)
                min_x = min(array_ax)
                min_y = min(array_ay)
                min_z = min(array_ax)

                # The return boolean will determine whether the data will be sent to the data base or not

                if (max_x >= 0.4 or max_y >= 0.4 or max_z >= 2 or min_x <= -0.4 or min_y <= -0.4 or min_z <= -2):
                    print("Finish reading data...")
                    return True, major_array, array_ax, array_ay, array_az

                else:
                    return False, major_array, array_ax, array_ay, array_az

        except OSError:
            print(
                "Error occured on the program loosed connection between the raspi and the sensor")


# Function for the processing of data
# Preprocessing of data includes transformation of time domain data to a frequency domain data using FFT
def process_data(datax, datay, dataz):

    # Initialize the variable to be used in preprocessing

    fx = []
    fy = []
    fz = []
    farray = []

    t = np.arange(0, 1, 1/100)
    samplesize = np.size(t)

    print("Processing data...")
    dataProcessX, dataProcessY, dataProcessZ = datax, datay, dataz

    fr = (100/2)*np.linspace(0, 1, int(samplesize/2))

    X1 = fft(np.subtract(dataProcessX, mean(dataProcessX)))
    X_m1 = (2/samplesize)*abs(X1[0:np.size(fr)])

    Y2 = fft(np.subtract(dataProcessY, mean(dataProcessY)))
    Y_m1 = (2/samplesize)*abs(Y2[0:np.size(fr)])

    Z3 = fft(np.subtract(dataProcessZ, mean(dataProcessZ)))
    Z_m1 = (2/samplesize)*abs(Z3[0:np.size(fr)])

    for d in range(50):
        fx.append(X_m1[d])
        fy.append(Y_m1[d])
        fz.append(Z_m1[d])

        farray.append([fx[d], fy[d], fz[d], round(fr[d])])

        if (len(farray) == 50):

            print("Finish processing data...")
            return farray, fx, fy, fz


# Function for the sending data on the database
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
        response = requests.post(
            f'http://192.168.1.18:8000/readings', data=json.dumps(body), headers=header)
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


# Main function for the whole process
# Connection to database --> Data gathering --> Data Processing --> Data Sending

def main():
    count = 0
    while True:
        if count == 4:
            break
        start_time = time.time()
        time_stamp = str(datetime.now(timezone.utc).astimezone(PHI).isoformat())
        thresh, rawList, ax, ay, az = gather_data()

        if (thresh == True):
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(process_data, ax, ay, az)
                fftList, fx, fy, fz = future.result()
                send = threading.Thread(target=send_data, args=[
                                        rawList, ax, ay, az, fftList, fx, fy, fz, time_stamp])
                send.start()
                send.join()
                print(time.time() - start_time)

        else:
            print("Data do not passed the given threshold")
        # break
        count += 1


if __name__ == "__main__":
    main()

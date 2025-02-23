from os import listdir, rename
from os.path import isfile, join
files = [f for f in listdir('.') if isfile(f)]
fs=[
    "disp","arm","diff","nor"
]
for f in files:
    fileType=0
    if(f.__contains__("_arm_")):
        fileType=1
    elif(f.__contains__("_diff_")):
        fileType=2
    elif(f.__contains__("_nor_")):
        fileType=3
    elif(f.__contains__("_disp_")):
        fileType=0
    rename(f,fs[fileType]+".jpg")

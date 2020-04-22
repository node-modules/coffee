#!/bin/bash

i=0
while [ : ]
do
    i=$(($i+1))
    if [ $i -eq 10 ]; then echo "egg-ready"; fi
    echo "$i"
    sleep 0.1
done

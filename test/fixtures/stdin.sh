#!/bin/bash

all=""

while true; do
  read -n 1 data
  echo -n "$data"
  if [[ $data = $'\n' ]]; then
    echo -n $data
    exit;
  else
    all=all+$data
  fi
done

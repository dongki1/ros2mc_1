#!/bin/bash

PS_NAME=JN_uav_env
VERSION="$1"

if [ "$2" == "new" ]; then
    unset DOCKER_HOST
    xhost +
    
    docker stop "$PS_NAME"
    docker rm "$PS_NAME"
    
    docker run -it --privileged \
    -e DISPLAY=":0" \
    --env="QT_X11_NO_MITSHM=1" \
    -v /tmp/.X11-unix:/tmp/.X11-unix:ro \
    -v /home/$USER/ros2_link_ws:/home/jetson/ros2_link_ws \
    -v /dev:/dev:rw \
    --group-add dialout \
    --runtime nvidia \
    --network host \
    --name "$PS_NAME" \
    scshin818/autonomous:JN_uav_env_"$VERSION" bash
else
    docker exec -it "$PS_NAME" bash
fi

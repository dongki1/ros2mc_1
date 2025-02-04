#!/bin/bash

source /opt/ros/humble/setup.bash
#source /home/jetson/ros2_ws/install/local_setup.bash
source /home/jetson/ros2_link_ws/install/local_setup.bash
source /usr/share/colcon_argcomplete/hook/colcon-argcomplete.bash

#python3 /home/jetson/ros2_ws/src/run_uav/run_uav.py
ros2 launch run_uav run_uav.py

#ros2 bag record -a

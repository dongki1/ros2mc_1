import launch
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='kari_UAV_siyi',
            namespace='zr10_1',
            executable='siyi_control_node',
            name='uav1'
        ),
        Node(
            package='kari_UAV_siyi',
            namespace='zr10_1',
            executable='siyi_stream_node',
            name='uav1'
        )#,
        #Node(
            #package='kari_drone_system',
            #executable='example.launch.py',
            #name='uav1'
        #)#,
        #launch.actions.ExecuteProcess(
        #    cmd=['ros2', 'bag', 'record', '-a'],
        #    cwd='/home/jetson/ros2_link_ws'
        #    #output='screen'
        #)
        
    ])

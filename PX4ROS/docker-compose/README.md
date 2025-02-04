ros2 topic pub -r 10 /greetings std_msgs/msg/String "{data: 'hello'}"

ros2 daemon stop & ros2 topic echo /greetings
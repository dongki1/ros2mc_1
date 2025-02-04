"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../service/logger");
const logger = new logger_1.Logger('ros2.channel');
const rclnodejs_1 = require("rclnodejs");
const rclnodejs_2 = require("rclnodejs");
const rclnodejs_3 = require("rclnodejs");
const rclnodejs = __importStar(require("rclnodejs"));
const vehicle_datastore_1 = __importDefault(require("../datastore/vehicle.datastore"));
const utils = __importStar(require("../service/utils"));
const VehicleCommand = rclnodejs.require('px4_msgs/msg/VehicleCommand');
const PX4_VEHICLE_NAME_NONAME = '##NONAME##';
const PX4_TOPIC_PREFIX = vehicle_datastore_1.default.settings()['rosFmuTopicPrefix'] || '';
const ROS2_TOPIC_LIST = [
    [`${PX4_TOPIC_PREFIX}/fmu/out/vehicle_status`, 'px4_msgs/msg/VehicleStatus'],
    [`${PX4_TOPIC_PREFIX}/fmu/out/vehicle_attitude`, "px4_msgs/msg/VehicleAttitude"],
    [`${PX4_TOPIC_PREFIX}/fmu/out/vehicle_gps_position`, "px4_msgs/msg/SensorGps"],
    [`${PX4_TOPIC_PREFIX}/fmu/out/vehicle_local_position`, "px4_msgs/msg/VehicleLocalPosition"],
    ['/zr10_1/siyi/get_gimbal_attitude', "geometry_msgs/msg/Vector3Stamped"],
    ['/zr10_1/siyi/camera_stream', "sensor_msgs/msg/Image"],
    ['/kari/vehicle_command_json', "std_msgs/msg/String"],
];
class Ros2Channel {
    constructor() {
        this._node = null;
        this._subscriptionList = [];
        this._subscriptionTopicHandler = {};
        this._taggedImagePublisher = null;
        this._vehicleStatusPublisher = null;
        this._vehicleCommandPublisher = null;
        this._stopFlag = true;
    }
    async startChannel() {
        //  rclnodejs.init() 호출 
        await (0, rclnodejs_1.init)();
        this._node = new rclnodejs_2.Node('KARI_DRONE_MONITOR_SYSTEM');
        try {
            //  ARMED vehicle에서 GEO 정보 tagging된 이미지를 publish하여 ground system에서 사용할 수 있도록 하기 위한 ros2 publish
            const taggedImageTopic = `/${vehicle_datastore_1.default.vehicle()?.name}/tagged_stream`;
            console.log("Tagging Image Publish topic: ", taggedImageTopic);
            this._taggedImagePublisher = this._node.createPublisher('sensor_msgs/msg/CompressedImage', taggedImageTopic);
            vehicle_datastore_1.default.on(vehicle_datastore_1.default.EVENT_TYPES.EVENT_IMAGE_CAPTURED_BUFFER, (data) => {
                this.publishTaggedImage(data);
            });
            //  연결된 모든 vehicle들에 대한 비행 정보를 ground system에 전달.
            //  ground system에서 arm 명령을 선택적으로 하기 위해서 추가한 기능 
            //  vehicle 공통으로 사용하고, stringify된 JSON 데이터에 vehicle 구분 
            const vehicleStatusTopic = `/kari/vehicle_status_json`;
            this._vehicleStatusPublisher = this._node.createPublisher('std_msgs/msg/String', vehicleStatusTopic);
            vehicle_datastore_1.default.on(vehicle_datastore_1.default.EVENT_TYPES.EVENT_STATUS_UPDATED, (vehicle, armingTime, vehicleStatus) => {
                const message = [
                    vehicleStatus.latitude,
                    vehicleStatus.longitude,
                    vehicleStatus.altitude,
                    vehicleStatus.roll,
                    vehicleStatus.pitch,
                    vehicleStatus.yaw,
                    vehicleStatus.heading,
                    vehicleStatus.relative_alt,
                    vehicleStatus.speed_x,
                    vehicleStatus.speed_y,
                    vehicleStatus.speed_z,
                    vehicleStatus.gimbal_roll,
                    vehicleStatus.gimbal_pitch,
                    vehicleStatus.gimbal_yaw,
                    vehicleStatus.gimbal_yaw_abs //  GIMBAL_YAW_ABS
                ];
                this.publishVehicleStatus(vehicle, message);
            });
        }
        catch (ex) {
            console.log(ex);
        }
        try {
            const topic = `${PX4_TOPIC_PREFIX}/fmu/in/vehicle_command`;
            console.log("Vehicle command publish topic: ", topic);
            this._vehicleCommandPublisher = this._node.createPublisher('px4_msgs/msg/VehicleCommand', topic);
        }
        catch (ex) {
            console.log(ex);
        }
        //  관련 ROS topic들에 대한 subscription 생성 
        for (let i = 0; i < ROS2_TOPIC_LIST.length; i++) {
            const subTopic = ROS2_TOPIC_LIST[i][0];
            const strType = ROS2_TOPIC_LIST[i][1];
            let subscriptionTopicHandler = this._subscriptionTopicHandler[subTopic];
            if (!subscriptionTopicHandler) {
                subscriptionTopicHandler = async (message) => {
                    switch (subTopic) {
                        case `${PX4_TOPIC_PREFIX}/fmu/out/vehicle_status`:
                            vehicle_datastore_1.default.updateRos2VehicleStatus(message);
                            break;
                        case `${PX4_TOPIC_PREFIX}/fmu/out/vehicle_attitude`:
                            vehicle_datastore_1.default.updateRos2VehicleAttitude(message);
                            break;
                        case `${PX4_TOPIC_PREFIX}/fmu/out/vehicle_gps_position`:
                            vehicle_datastore_1.default.updateRos2SensorGps(message);
                            break;
                        case `${PX4_TOPIC_PREFIX}/fmu/out/vehicle_local_position`:
                            vehicle_datastore_1.default.updateRos2VehicleLocalPosition(message);
                            break;
                        case '/zr10_1/siyi/camera_stream':
                            vehicle_datastore_1.default.updateRos2CameraStream(message);
                            break;
                        case '/zr10_1/siyi/get_gimbal_attitude':
                            vehicle_datastore_1.default.updateRos2GimbalAttitude(message);
                            break;
                        case '/kari/vehicle_command_json':
                            let commandString = message.data;
                            let command = JSON.parse(commandString);
                            let vehicles = command.vehicles;
                            console.log("Vehicle command: ", command.command, vehicles, vehicle_datastore_1.default.vehicleName());
                            if (vehicles.indexOf(vehicle_datastore_1.default.vehicleName()) == -1)
                                break;
                            switch (command.command) {
                                case 'arm': {
                                    await this.arm();
                                    break;
                                }
                                case 'disarm': {
                                    await this.disarm();
                                    break;
                                }
                                case 'takeoff': {
                                    await this.arm();
                                    await utils.wait(4000);
                                    const vehicleStatus = vehicle_datastore_1.default?.vehicleStatus();
                                    if (vehicleStatus && vehicleStatus?.longitude && vehicleStatus?.latitude) {
                                        await this.takeoff(vehicleStatus.latitude, vehicleStatus.longitude, 30.0);
                                    }
                                    break;
                                }
                                case 'land': {
                                    await this.land();
                                    break;
                                }
                            }
                            break;
                    }
                };
                this._subscriptionTopicHandler[subTopic] = subscriptionTopicHandler;
            }
            const subscription = this._node?.createSubscription(strType, subTopic, { qos: rclnodejs_3.QoS.profileSensorData }, subscriptionTopicHandler);
            this._subscriptionList.push(subscription);
        }
        this._stopFlag = false;
        this._node?.spin();
    }
    async stopChannel() {
        (0, rclnodejs_1.shutdown)();
        this._subscriptionList = [];
        this._subscriptionTopicHandler = {};
        this._stopFlag = false;
    }
    isStarted() {
        return !this._stopFlag;
    }
    publishTaggedImage(buffer) {
        const arrayBuffer = new ArrayBuffer(buffer.length);
        const data = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buffer.length; ++i) {
            data[i] = buffer[i];
        }
        if (this._taggedImagePublisher) {
            const now = new rclnodejs_1.Time().secondsAndNanoseconds;
            const message = {
                header: {
                    stamp: {
                        sec: now.seconds,
                        nanosec: now.nanoseconds
                    },
                    frame_id: 'frame_id'
                },
                format: 'jpeg',
                data: data
            };
            const strMesg = {
                data: buffer.toString('hex')
            };
            this._taggedImagePublisher.publish(message);
        }
    }
    publishVehicleStatus(vehicle, vehicleStatusValues) {
        if (this._vehicleStatusPublisher) {
            const data = {
                vehicle: vehicle,
                vehicleStatusValues: vehicleStatusValues
            };
            const message = {
                data: JSON.stringify(data)
            };
            this._vehicleStatusPublisher.publish(message);
        }
    }
    _parseTopic(topic) {
        const result = {
            droneName: '',
            topic: ''
        };
        const nameTokens = topic.split('/');
        if (nameTokens[1] == 'fmu') {
            result.droneName = PX4_VEHICLE_NAME_NONAME;
            result.topic = topic;
        }
        else if (nameTokens[2] == 'fmu') {
            result.droneName = nameTokens[1];
            nameTokens.splice(1, 1);
            result.topic = nameTokens.join('/');
        }
        else {
            return null;
        }
        return result;
    }
    async _publishVehicleCommand(command, param1, param2, param3, param4, param5, param6, param7) {
        const vehicleSystemId = vehicle_datastore_1.default.vehicle()?.sysId;
        if (this._vehicleCommandPublisher) {
            const vehicleCommand = rclnodejs.createMessageObject('px4_msgs/msg/VehicleCommand');
            const now = new rclnodejs_1.Time().secondsAndNanoseconds;
            if (param1 != undefined)
                vehicleCommand.param1 = param1;
            if (param2 != undefined)
                vehicleCommand.param2 = param2;
            if (param3 != undefined)
                vehicleCommand.param3 = param3;
            if (param4 != undefined)
                vehicleCommand.param4 = param4;
            if (param5 != undefined)
                vehicleCommand.param5 = param5;
            if (param6 != undefined)
                vehicleCommand.param6 = param6;
            if (param7 != undefined)
                vehicleCommand.param7 = param7;
            vehicleCommand.timestamp = now.seconds + now.nanoseconds / 1000;
            vehicleCommand.command = command;
            vehicleCommand.target_system = vehicleSystemId || 1;
            vehicleCommand.target_component = 1;
            vehicleCommand.source_system = 1;
            vehicleCommand.source_component = 1;
            vehicleCommand.from_external = true;
            vehicleCommand.confirmation = 1;
            this._vehicleCommandPublisher.publish(vehicleCommand);
        }
    }
    async setMode() {
        // const command = new px4_msgs.msg.VehicleCommand()
        //  400 : VEHICLE_CMD_COMPONENT_ARM_DISARM
        this._publishVehicleCommand(VehicleCommand.VEHICLE_CMD_DO_SET_MODE, 1.0, 6.0, undefined, undefined, undefined, undefined, undefined);
    }
    async arm() {
        // const command = new px4_msgs.msg.VehicleCommand()
        //  400 : VEHICLE_CMD_COMPONENT_ARM_DISARM
        this._publishVehicleCommand(VehicleCommand.VEHICLE_CMD_COMPONENT_ARM_DISARM, 1.0, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    async disarm() {
        //  400 : VEHICLE_CMD_COMPONENT_ARM_DISARM
        this._publishVehicleCommand(VehicleCommand.VEHICLE_CMD_COMPONENT_ARM_DISARM, 0.0, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    async takeoff(latitude, longitude, altitude) {
        // const command = new px4_msgs.msg.VehicleCommand()
        //  22 : VEHICLE_CMD_NAV_TAKEOFF
        //  parma1~7 : pitch, NAN, NAN, yaw, lat, lon, alt
        this._publishVehicleCommand(VehicleCommand.VEHICLE_CMD_NAV_TAKEOFF, 0.0, undefined, undefined, undefined, latitude, longitude, altitude);
    }
    async land() {
        // const command = new px4_msgs.msg.VehicleCommand()
        //  22 : VEHICLE_CMD_NAV_TAKEOFF
        //  parma1~7 : pitch, NAN, NAN, yaw, lat, lon, alt
        this._publishVehicleCommand(VehicleCommand.VEHICLE_CMD_NAV_LAND, undefined, undefined, undefined, undefined, 37.0, 127.0, 20.0);
    }
}
const ros2Channel = new Ros2Channel();
exports.default = ros2Channel;
//# sourceMappingURL=ros2.channel.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../service/logger");
const logger = new logger_1.Logger('drone.controller');
const vehicle_datastore_1 = __importDefault(require("../../datastore/vehicle.datastore"));
const channel_manager_1 = __importDefault(require("../../channels/channel.manager"));
class DroneController {
    constructor() {
    }
    async getStoreData() {
        let status = 200;
        const _vehicle = vehicle_datastore_1.default.vehicle();
        const _camera = vehicle_datastore_1.default.camera();
        const _armingTime = vehicle_datastore_1.default.armingTime();
        const _vehicleStatus = vehicle_datastore_1.default.vehicleStatus();
        const _trajectory = vehicle_datastore_1.default.trajectory();
        const _captureImages = vehicle_datastore_1.default.captureImages();
        let vehicleStatus = {
            armingTime: _armingTime,
            position: [_vehicleStatus?.longitude, _vehicleStatus?.latitude],
            altitude: _vehicleStatus?.relative_alt,
            heading: _vehicleStatus?.heading,
            attitude: [_vehicleStatus?.roll, _vehicleStatus?.pitch, _vehicleStatus?.yaw],
            gimbal: [_vehicleStatus?.gimbal_roll, _vehicleStatus?.gimbal_pitch, _vehicleStatus?.gimbal_yaw, _vehicleStatus?.gimbal_yaw_abs],
        };
        let trajectory = null;
        if (_trajectory) {
            trajectory = {
                timestamp: [],
                path: [[]],
                altitude: [],
                heading: [],
                attitude: [],
                gimbal: []
            };
            _trajectory.forEach((item) => {
                trajectory.timestamp.push(item.timestamp);
                trajectory.path[0].push(item.position);
                trajectory.altitude.push(item.altitude);
                trajectory.heading.push(item.heading);
                trajectory.attitude.push(item.attitude);
                trajectory.gimbal.push(item.gimbal);
            });
        }
        let captures = null;
        if (_captureImages) {
            captures = {
                timestamp: [],
                path: [],
            };
            _captureImages.forEach((item) => {
                captures.timestamp.push(item.timestamp);
                captures.path[0].push(item.imagePath);
            });
        }
        const result = {
            vehicle: _vehicle,
            camera: _camera,
            vehicleStatus,
            trajectory,
            captures
        };
        return { status, result };
    }
    async wait(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve();
            }, time);
        });
    }
    async sendVehicleCommand(command, params) {
        let status = 200;
        if (command == 'arm') {
            await channel_manager_1.default.sendRos2ArmCommand();
            await this.wait(6000);
            await channel_manager_1.default.sendRos2TakeoffCommand();
        }
        else if (command == 'disarm') {
            await channel_manager_1.default.sendRos2DisarmCommand();
        }
        else if (command == 'takeoff') {
            await channel_manager_1.default.sendRos2TakeoffCommand();
        }
        else if (command == 'land') {
            await channel_manager_1.default.sendRos2LandCommand();
        }
        const result = {
            command: command,
            result: 'ok'
        };
        return { status, result };
    }
}
const droneController = new DroneController();
exports.default = droneController;
//# sourceMappingURL=vehicle.controller.js.map
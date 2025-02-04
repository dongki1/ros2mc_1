"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../service/logger");
const logger = new logger_1.Logger('channel.manager');
const ros2_channel_1 = __importDefault(require("./ros2.channel"));
const camera_channel_1 = __importDefault(require("./camera.channel"));
const vehicle_datastore_1 = __importDefault(require("./../datastore/vehicle.datastore"));
class ChannelManager {
    constructor() {
        this._channels = {};
    }
    startChannels() {
        const settings = vehicle_datastore_1.default.settings();
        this._channels['ros2'] = ros2_channel_1.default;
        if (settings['cameraInterface'] == 'CAM') {
            this._channels['cam'] = camera_channel_1.default;
        }
        const channelKeys = Object.keys(this._channels);
        channelKeys.forEach((channelKey) => {
            this._channels[channelKey].startChannel();
        });
    }
    async sendRos2ArmCommand() {
        return ros2_channel_1.default.arm();
    }
    async sendRos2DisarmCommand() {
        return ros2_channel_1.default.disarm();
    }
    async sendRos2TakeoffCommand() {
        const vehicleStatus = vehicle_datastore_1.default?.vehicleStatus();
        if (vehicleStatus && vehicleStatus?.longitude && vehicleStatus?.latitude) {
            await ros2_channel_1.default.takeoff(vehicleStatus.latitude, vehicleStatus.longitude, 30.0);
        }
        return;
    }
    async sendRos2LandCommand() {
        return ros2_channel_1.default.land();
    }
}
const channelManager = new ChannelManager();
exports.default = channelManager;
//# sourceMappingURL=channel.manager.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../service/logger");
const logger = new logger_1.Logger('notification.service');
const interface_types_1 = require("./interface.types");
const vehicle_datastore_1 = __importDefault(require("../datastore/vehicle.datastore"));
class NotificationService {
    constructor() {
        this._io = null;
        this._clientSockets = {};
    }
    /**
     */
    start(io) {
        try {
            this._io = io;
            this._io.on('connection', (socket) => {
                this._clientSockets[socket.id] = socket;
                logger.debug(`Client socket [${socket.id}] is connected`);
                socket.on('disconnect', () => {
                    delete this._clientSockets[socket.id];
                    logger.debug(`Client socket [${socket.id}] is disconnected`);
                });
            });
            vehicle_datastore_1.default.on(vehicle_datastore_1.default.EVENT_TYPES.EVENT_ARMED, (vehicle, armedTime) => {
            });
            vehicle_datastore_1.default.on(vehicle_datastore_1.default.EVENT_TYPES.EVENT_DISARMED, (vehicle) => {
            });
            vehicle_datastore_1.default.on(vehicle_datastore_1.default.EVENT_TYPES.EVENT_STATUS_UPDATED, (vehicle, armingTime, vehicleStatus) => {
                const message = {
                    timestamp: new Date().getTime(),
                    vehicleStatus: {
                        armingTime: armingTime,
                        position: [vehicleStatus.longitude, vehicleStatus.latitude],
                        altitude: vehicleStatus.relative_alt,
                        heading: vehicleStatus.heading,
                        attitude: [vehicleStatus.roll, vehicleStatus.pitch, vehicleStatus.yaw],
                        gimbal: [vehicleStatus.gimbal_roll, vehicleStatus.gimbal_pitch, vehicleStatus.gimbal_yaw, vehicleStatus.gimbal_yaw_abs]
                    }
                };
                this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_STATUS_UPDATED, message);
            });
            vehicle_datastore_1.default.on(vehicle_datastore_1.default.EVENT_TYPES.EVENT_IMAGE_CAPTURED, (timestamp, sortie, imagePath) => {
                logger.debug(`EVENT_IMAGE_CAPTURED]  `);
                const message = {
                    timestamp,
                    sortie,
                    imagePath
                };
                this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_IMAGE_CAPTURED, message);
            });
        }
        catch (e) {
            logger.info(e);
        }
    }
    notifyAll(event, message) {
        if (this._io) {
            this._io.emit(event, message);
        }
    }
    notifyVehicleMessage(event, message) {
        if (this._io) {
            this._io.emit(event, message);
        }
    }
    notifyVehicleConnected(timestamp, vehicle) {
        const message = {
            timestamp,
            vehicle
        };
        this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_CONNECTED, message);
    }
    notifyVehicleDisconnected(timestamp, vehicle) {
        const message = {
            timestamp,
            vehicle
        };
        this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_CONNECTED, message);
    }
    notifyVehicleArmingStateChanged(timestamp, armed) {
        const message = {
            timestamp,
            armed
        };
        this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_ARMED_DISARMED, message);
    }
    notifyVehicleImageCaptured(timestamp, imagePath) {
        const message = {
            timestamp,
            imagePath
        };
        this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_IMAGE_CAPTURED, message);
    }
    notifyVehicleStatusChanged(timestamp, vehicleStatus) {
        const message = {
            timestamp,
            vehicleStatus
        };
        this.notifyVehicleMessage(interface_types_1.CNotificationEventType.VEHICLE_STATUS_UPDATED, message);
    }
}
const notificationService = new NotificationService();
exports.default = notificationService;
//# sourceMappingURL=notification.servic.js.map
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
const logger = new logger_1.Logger('camera.channel');
const node_webcam_1 = __importDefault(require("node-webcam"));
const vehicle_datastore_1 = __importDefault(require("../datastore/vehicle.datastore"));
const _ = __importStar(require("lodash"));
const path_1 = __importDefault(require("path"));
const mkdirp_1 = require("mkdirp");
const BASE_OPTIONS = {
    //Picture related
    width: 1280,
    height: 720,
    quality: 95,
    // Number of frames to capture
    // More the frames, longer it takes to capture
    // Use higher framerate for quality. Ex: 60
    frames: 5,
    //Delay in seconds to take shot
    //if the platform supports miliseconds
    //use a float (0.1)
    //Currently only on windows
    delay: 0,
    //Save shots in memory
    saveShots: true,
    // [jpeg, png] support varies
    // Webcam.OutputTypes
    output: "jpeg",
    //Which camera to use
    //Use Webcam.list() for results
    //false for default device
    device: '',
    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes
    callbackReturn: "location",
    //Logging
    verbose: false
};
const CAMERA_CAPTURE_INTERVAL = 100;
class CameraChannel {
    constructor() {
        this._stopFlag = false;
        this._webcam = null;
        this._imageSequence = 0;
        const settings = vehicle_datastore_1.default.settings();
        this._webcamOptions = _.merge({}, BASE_OPTIONS, {
            device: settings.cameraDevice,
        });
    }
    async startChannel() {
        this._stopFlag = false;
        try {
            this._webcam = node_webcam_1.default.create(this._webcamOptions);
            this._imageSequence = 0;
            while (!this._stopFlag) {
                await this.capture();
                await new Promise(resolve => setTimeout(resolve, CAMERA_CAPTURE_INTERVAL));
            }
        }
        catch (ex) {
            logger.error('camera capture error', ex);
            this._stopFlag = false;
        }
    }
    capture() {
        return new Promise((resolve, reject) => {
            try {
                if (!this._webcam)
                    return reject('webcam is not avaliable');
                const settings = vehicle_datastore_1.default.settings();
                const fileName = `${settings.vehicleName}-${String(this._imageSequence++).padStart(8, '0')}.jpg`;
                const captureFilePath = path_1.default.join(process.cwd(), 'SORTIE', 'capture', fileName);
                (0, mkdirp_1.mkdirpSync)(path_1.default.join(process.cwd(), 'SORTIE', 'capture'));
                this._webcam.capture(captureFilePath, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        // const buffer = fs.readFileSync(data)
                        // let encode = Buffer.from(buffer).toString('base64'); //파일 인코딩
                        const width = BASE_OPTIONS.width || 800;
                        const height = BASE_OPTIONS.height || 600;
                        vehicle_datastore_1.default.updateWebcamCameraStream(width, height, data);
                        return resolve();
                    }
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    async stopChannel() {
        this._stopFlag = true;
    }
    isStarted() {
        return !this._stopFlag;
    }
}
const cameraChannel = new CameraChannel();
exports.default = cameraChannel;
//# sourceMappingURL=camera.channel.js.map
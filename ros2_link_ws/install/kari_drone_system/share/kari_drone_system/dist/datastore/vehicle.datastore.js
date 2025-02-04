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
const _ = __importStar(require("lodash"));
const sharp_1 = __importDefault(require("sharp"));
const piexif = __importStar(require("piexif-ts"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mkdirp_1 = require("mkdirp");
const moment_1 = __importDefault(require("moment"));
const events_1 = __importDefault(require("events"));
const logger = new logger_1.Logger('drone.datastore');
class VehicleDatastore {
    constructor() {
        this.EVENT_TYPES = {
            EVENT_ARMED: "event.armed",
            EVENT_DISARMED: "event.disarmed",
            EVENT_IMAGE_CAPTURED: "event.image-captured",
            EVENT_IMAGE_CAPTURED_BUFFER: "event.image-captured.buffer",
            EVENT_STATUS_UPDATED: "event.status.updated",
        };
        this._datastore = {
            vehicle: {
                name: 'uav_001',
                sysId: 0,
                uxvType: 'UAV',
                color: 'rgb(255,0.0)',
            },
            camera: {
                cameraNumber: '1',
                cameraframe: 20,
                resolution: { width: 800, height: 600 }
            },
            armingTime: null,
            vehicleStatus: null,
            trajectory: [],
            captureImages: [],
            settings: {
                vehicleName: '',
                vehicleType: 'UAV',
                vehicleColor: 'rgb(255,0,0)',
                cameraDevice: '',
                cameraInterface: 'ROS',
                rosFmuTopicPrefix: ''
            },
            channels: {}
        };
        this._loaded = false;
        this._eventEmitter = new events_1.default();
    }
    vehicle() {
        return this._datastore.vehicle;
    }
    camera() {
        return this._datastore.camera;
    }
    armingTime() {
        return this._datastore.armingTime;
    }
    vehicleStatus() {
        return this._datastore.vehicleStatus;
    }
    trajectory() {
        return this._datastore.trajectory;
    }
    captureImages() {
        return this._datastore.captureImages;
    }
    settings() {
        this.loadSettings();
        return this._datastore.settings;
    }
    vehicleName() {
        if (this._datastore.vehicle)
            return this._datastore.vehicle.name;
        else
            return null;
    }
    on(event, listener) {
        this._eventEmitter.on(event, listener);
    }
    updateVehicleInfo(vehicle) {
        this._datastore.vehicle = _.merge({}, this._datastore.vehicle, vehicle);
        //  TODO: notify vehicle info has been updated
    }
    /**
     * _armingTime 값 update
     *
     *      현재 _armingTime 값이 null이 아닌 상태에서
     *          VehicleStatus.arming_state 값이 DISARMED가 수신된 경우
     *          _armingTime 값을 null로 변경
     *
     *      현재 _armingTime 값이 null인 상태에서
     *          VehicleStatus.arming_state 값이 ARMED가 수신된 경우
     *          _armingTime 값을 현재 시간으로 변경하고,
     *          _trajectory 목록을 초기화
     *
     * @param ros2Data
     */
    updateRos2VehicleStatus(ros2Data) {
        //  DISARMED 상태를 수신했을 때 
        if (ros2Data.arming_state == 1) { // 1: ARMING_STATE_DISARMED
            //  기존에 비행 중 상태인 경우 
            if (this._datastore.armingTime != null) {
                //  비행중이 아닌 상태로 전환하고, DISARMED event 발생 
                this._datastore.armingTime = null;
                this._eventEmitter.emit(this.EVENT_TYPES.EVENT_DISARMED, this._datastore.vehicle);
            }
            else {
                //  NO Operation
            }
        }
        //  ARMED 상태를 수신했을 때 
        else if (ros2Data.arming_state == 2) { // 2: 0ARMING_STATE_ARMED
            //  기존에 비행 중 상태가 아닌경우 
            if (this._datastore.armingTime == null) {
                //  trajectory 데이터와 capture image 목록 데이터 초기화하고 
                this._datastore.trajectory = [];
                this._datastore.captureImages = [];
                //  비행중 상태로 전환하고 ARMED 이벤트 발생 
                this._datastore.armingTime = new Date().getTime();
                this._eventEmitter.emit(this.EVENT_TYPES.EVENT_ARMED, this._datastore.vehicle, this._datastore.armingTime);
            }
            else {
                //  NO Operation
            }
        }
        if (this._datastore.vehicle)
            this._datastore.vehicle.sysId = ros2Data.system_id;
    }
    loadSettings() {
        if (this._loaded)
            return;
        const settingFilePath = path_1.default.join(process.cwd(), 'settings.json');
        let settings = {};
        try {
            const jsonFile = fs_1.default.readFileSync(settingFilePath, 'utf8');
            settings = JSON.parse(jsonFile);
        }
        catch (ex) {
            settings = {
                vehicleName: '',
                vehicleType: 'UAV',
                vehicleColor: 'red',
                cameraDevice: '',
                cameraInterface: 'CAM',
                rosFmuTopicPrefix: ''
            };
        }
        const vehicle = {};
        if (settings.vehicleName)
            vehicle.name = settings.vehicleName;
        if (settings.vehicleType)
            vehicle.uxvType = settings.vehicleType;
        if (settings.vehicleColor)
            vehicle.color = settings.vehicleColor;
        this._datastore.vehicle = _.merge(this._datastore.vehicle, vehicle);
        this._datastore.settings = _.merge(this._datastore.settings, settings);
        this._loaded = true;
    }
    /**
     * 주어진 vehicleStatus에서 trajectory 에 저장할 정보를 추출하여 trajectory에 추가.
     * TODO: 특정 시간 간격을 두고 trajectory에 추가하는게 필요할지 여부를 고려해야 한다.
     *
     * @param vehicleStatus
     */
    _updateVehicleStatus(vehicleStatus) {
        //  drone datastore의 flight update 
        this._datastore.vehicleStatus = _.merge(this._datastore.vehicleStatus, vehicleStatus);
        const updatedVehicleStatus = this._datastore.vehicleStatus;
        this._eventEmitter.emit(this.EVENT_TYPES.EVENT_STATUS_UPDATED, this._datastore.vehicle, this._datastore.armingTime, updatedVehicleStatus);
        //  TODO: trajectory의 마지막 아이템의 timestamp와 현재 timestamp를 비교해서, 
        //        지정된 간격 이내이면 저장하지 않고 return 
        //  드론의 상태가 flying이 아닌 경우에는 trajectory에 추가하지 않는다.
        if (this._datastore.armingTime == null)
            return;
        //  trajectory 데이터 추가에 필요한 모든 정보가 있는지 확인.
        if (!updatedVehicleStatus.latitude || !updatedVehicleStatus.longitude)
            return;
        if (!updatedVehicleStatus.heading)
            return;
        if (!updatedVehicleStatus.gimbal_roll || !updatedVehicleStatus.gimbal_pitch || !updatedVehicleStatus.gimbal_yaw || !updatedVehicleStatus.gimbal_yaw_abs)
            return;
        //  trajectory 데이터 추출 
        let trajectoryPoint = {
            timestamp: new Date().getTime(),
            position: { latitude: updatedVehicleStatus.latitude, longitude: updatedVehicleStatus.longitude },
            altitude: updatedVehicleStatus.relative_alt,
            heading: updatedVehicleStatus.heading,
            attitude: { roll: updatedVehicleStatus.roll, pitch: updatedVehicleStatus.pitch, yaw: updatedVehicleStatus.yaw },
            gimbal: { roll: updatedVehicleStatus.gimbal_roll, pitch: updatedVehicleStatus.gimbal_pitch, yaw: updatedVehicleStatus.gimbal_yaw, yaw_abs: updatedVehicleStatus.gimbal_yaw_abs }
        };
        //  trajectory list에 추가 
        this._datastore.trajectory.push(trajectoryPoint);
    }
    /**
     * 시간값을 YYYYMMDDhhmmssSSS 형식의 문자열로 변환
     * @param captureTime
     */
    _getImageFileName(datetime) {
        //  ISOString 형식으로 변환해서 - : . Z T 값을 삭제 
        return (0, moment_1.default)(datetime).format('YYYYMMDDhhmmssSSS');
    }
    /**
     *
     * @param image
     * @returns
     */
    _updateCaptureImage(width, height, imageData) {
        //  드론의 상태가 flying이 아닌 경우에는 캡쳐 이미지에 대한 처리를 하지 않는다
        if (this._datastore.armingTime == null)
            return;
        const captureTime = new Date();
        const armingTime = new Date(this._datastore.armingTime);
        //  비행 데이터로부터 image tagging 정보를 추출 
        const userComment = this._getTaggingData(captureTime);
        const sharpOptions = {
            raw: {
                width,
                height,
                channels: 3
            }
        };
        (0, sharp_1.default)(imageData, sharpOptions)
            // .resize(width, height) // 이미지 크기 조정 (필요한 경우)
            .toFormat('jpeg')
            // .raw()
            .toBuffer()
            .then((jpegBuffer) => {
            //  이미지 데이터를 binary string으로 변환해서 
            const imageString = jpegBuffer.toString('binary');
            //  exif 라이브러리로 로딩하고 
            const exifObj = piexif.load(imageString);
            //  /Exif/UserComment 에 만들어진 userComment 데이터 저장
            let exifField = exifObj['Exif'];
            if (!exifField) {
                exifField = {};
                exifObj['Exif'] = exifField;
            }
            exifField[piexif.TagValues.ExifIFD.UserComment] = userComment;
            //  이미지 파일에 exif 정보 update하고 
            var exifbytes = piexif.dump(exifObj);
            const taggedData = piexif.insert(exifbytes, imageString);
            //  이미지 파일을 쓰기 위해 Buffer로 변환 
            const taggedBuffer = Buffer.from(taggedData, "binary");
            //  File name은 
            //  {실행폴더}/SORTIE/{arming time의 YYYYMMDD}/capture-{captureTime의 YYYYMMDDhhmmSSsss}.jpg
            const sortie = this._getImageFileName(armingTime).substring(0, 14);
            const parentPath = path_1.default.join(process.cwd(), 'SORTIE', sortie);
            const fileName = `${this._datastore.settings.vehicleName}-${this._getImageFileName(captureTime)}.jpg`;
            const filePath = path_1.default.join(parentPath, fileName);
            console.log('SHARP TIME: ', armingTime, filePath);
            try {
                this._eventEmitter.emit(this.EVENT_TYPES.EVENT_IMAGE_CAPTURED_BUFFER, taggedBuffer);
            }
            catch (exRos2Pub) {
            }
            try {
                (0, mkdirp_1.mkdirpSync)(parentPath);
                fs_1.default.writeFileSync(filePath, taggedBuffer);
                this._eventEmitter.emit(this.EVENT_TYPES.EVENT_IMAGE_CAPTURED, captureTime.getTime(), sortie, fileName);
            }
            catch (ex) {
                logger.error(ex.message);
            }
        });
    }
    /**
   *
   * @param image
   * @returns
   */
    _updateCaptureImage2(width, height, imagePath) {
        //  드론의 상태가 flying이 아닌 경우에는 캡쳐 이미지에 대한 처리를 하지 않는다
        if (this._datastore.armingTime == null)
            return;
        const captureTime = new Date();
        const armingTime = new Date(this._datastore.armingTime);
        //  비행 데이터로부터 image tagging 정보를 추출 
        const userComment = this._getTaggingData(captureTime);
        const sharpOptions = {
            raw: {
                width,
                height,
                channels: 3
            }
        };
        (0, sharp_1.default)(imagePath)
            .toBuffer()
            .then((jpegBuffer) => {
            //  이미지 데이터를 binary string으로 변환해서 
            const imageString = jpegBuffer.toString('binary');
            //  exif 라이브러리로 로딩하고 
            const exifObj = piexif.load(imageString);
            //  /Exif/UserComment 에 만들어진 userComment 데이터 저장
            let exifField = exifObj['Exif'];
            if (!exifField) {
                exifField = {};
                exifObj['Exif'] = exifField;
            }
            exifField[piexif.TagValues.ExifIFD.UserComment] = userComment;
            //  이미지 파일에 exif 정보 update하고 
            var exifbytes = piexif.dump(exifObj);
            const taggedData = piexif.insert(exifbytes, imageString);
            //  이미지 파일을 쓰기 위해 Buffer로 변환 
            const taggedBuffer = Buffer.from(taggedData, "binary");
            //  File name은 
            //  {실행폴더}/SORTIE/{arming time의 YYYYMMDD}/capture-{captureTime의 YYYYMMDDhhmmSSsss}.jpg
            const sortie = this._getImageFileName(armingTime).substring(0, 14);
            const parentPath = path_1.default.join(process.cwd(), 'SORTIE', sortie);
            const fileName = `${this._datastore.settings.vehicleName}-${this._getImageFileName(captureTime)}.jpg`;
            const filePath = path_1.default.join(parentPath, fileName);
            console.log('ARMING TIME: ', armingTime, filePath);
            try {
                this._eventEmitter.emit(this.EVENT_TYPES.EVENT_IMAGE_CAPTURED_BUFFER, taggedBuffer);
            }
            catch (exRos2Pub) {
            }
            try {
                (0, mkdirp_1.mkdirpSync)(parentPath);
                fs_1.default.writeFileSync(filePath, taggedBuffer);
                this._eventEmitter.emit(this.EVENT_TYPES.EVENT_IMAGE_CAPTURED, captureTime.getTime(), sortie, fileName);
            }
            catch (ex) {
                logger.error(ex.message);
            }
        });
    }
    /**
     * 쿼터니언 형식의 드론 자세 정보를 roll pitch yaw 값으로 변환하는 함수
     *
     * @param quat Quaternion rotation from the FRD body frame to the NED earth frame
     * @returns [roll:number, pitch:number, yaw:number]
     */
    _getEulerAttitude(quat) {
        const [x, y, z, w] = quat.q;
        const t0 = 2.0 * (w * x + y * z);
        const t1 = 1.0 - 2.0 * (x * x + y * y);
        const roll = Math.atan2(t0, t1);
        let t2 = 2.0 * (w * y - z * x);
        t2 = (t2 > 1.0) ? 1.0 : t2;
        t2 = (t2 < -1.0) ? -1.0 : t2;
        const pitch = Math.asin(t2);
        const t3 = +2.0 * (w * z + x * y);
        const t4 = +1.0 - 2.0 * (y * y + z * z);
        const yaw = Math.atan2(t3, t4);
        return [roll, pitch, yaw];
    }
    /**
     * _vehicleStatus의 attitude 정보를 업데이트하고,
     * 업데이트된 _vehicleStatus를 기준으로 _trajectory에 추가.
     *
     * @param ros2Data
     */
    updateRos2VehicleAttitude(ros2Data) {
        const [roll, pitch, yaw] = this._getEulerAttitude(ros2Data);
        const vehicleStatus = {
            roll, pitch, yaw
        };
        //  _vehicleStatus를 update하고, update된 vehicleStatus를 trajectory에 추가 
        this._updateVehicleStatus(vehicleStatus);
    }
    /**
     * _vehicleStatus의 gps sencor 정보를 업데이트하고,
     * 업데이트된 _vehicleStatus를 기준으로 _trajectory에 추가.
     *
     * @param ros2Data
     */
    updateRos2SensorGps(ros2Data) {
        const latitude = ros2Data.lat / 1e7;
        const longitude = ros2Data.lon / 1e7;
        const altitude = ros2Data.alt_ellipsoid / 1e3;
        // const latitude = ros2Data.latitude_deg 
        // const longitude = ros2Data.longitude_deg
        // const altitude = ros2Data.altitude_msl_m
        const speed_x = ros2Data.vel_e_m_s;
        const speed_y = ros2Data.vel_n_m_s;
        const speed_z = ros2Data.vel_d_m_s;
        const vehicleStatus = {
            latitude, longitude, altitude, speed_x, speed_y, speed_z
        };
        if (!isNaN(ros2Data.heading))
            vehicleStatus['heading'] = ros2Data.heading;
        //  _vehicleStatus를 update하고, update된 vehicleStatus를 trajectory에 추가 
        this._updateVehicleStatus(vehicleStatus);
    }
    /**
     * _vehicleStatus의 local position 정보를 업데이트하고,
     * 업데이트된 _vehicleStatus를 기준으로 _trajectory에 추가.
     *
     * @param ros2Data
     */
    updateRos2VehicleLocalPosition(ros2Data) {
        const heading = ros2Data.heading;
        const relative_alt = ros2Data.dist_bottom;
        const vehicleStatus = {
            heading,
            relative_alt
        };
        //  _vehicleStatus를 update하고, update된 vehicleStatus를 trajectory에 추가 
        this._updateVehicleStatus(vehicleStatus);
    }
    updateRos2GimbalAttitude(ros2Data) {
        const gimbal_roll = ros2Data.vector.x;
        const gimbal_pitch = ros2Data.vector.y;
        const gimbal_yaw = ros2Data.vector.z;
        const gimbal_yaw_abs = ros2Data.vector.z;
        const vehicleStatus = {
            gimbal_roll, gimbal_pitch, gimbal_yaw, gimbal_yaw_abs
        };
        //  _vehicleStatus를 update하고, update된 vehicleStatus를 trajectory에 추가 
        this._updateVehicleStatus(vehicleStatus);
    }
    _getTaggingData(captureTime) {
        if (this._datastore.armingTime == null) {
            throw new Error('비행상태가 아닌데 tagging 정보 조회 요청');
        }
        if (this._datastore.vehicleStatus == null) {
            throw new Error('Vehicle의 상태 정보가 없는데 tagging 정보 조회 요청');
        }
        const dataConfiguration = {
            "Version": "1.0",
            "ID": this._datastore.vehicle?.name,
            "DateTime": new Date(this._datastore.armingTime).toISOString(),
            "CameraNumber": this._datastore.camera?.cameraNumber,
            "Cameraframe": this._datastore.camera?.cameraframe,
            "Resolution": `${this._datastore.camera?.resolution.width}x${this._datastore.camera?.resolution.height}`
        };
        const vehicleStatus = this._datastore.vehicleStatus;
        const value = [
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
        const strDataConfiguration = JSON.stringify(dataConfiguration);
        const strTimestamp = captureTime.toISOString().replace(/\-|\:/g, '');
        const strValue = JSON.stringify(value);
        const taggingInfo = `DataConfiguration: ${strDataConfiguration}; Timestamp: ${strTimestamp}, Value: ${strValue}`;
        return taggingInfo;
    }
    _toArrayBuffer(buffer) {
        const arrayBuffer = new ArrayBuffer(buffer.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return view;
    }
    updateRos2CameraStream(ros2Data) {
        const { width, height, data } = ros2Data;
        console.log('updateRos2CameraStream');
        this._updateCaptureImage(width, height, data);
    }
    updateWebcamCameraStream(width, height, imagePath) {
        this._updateCaptureImage2(width, height, imagePath);
    }
}
const droneDatastore = new VehicleDatastore();
exports.default = droneDatastore;
//# sourceMappingURL=vehicle.datastore.js.map
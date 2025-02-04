/** * * * * * * * * * * * * * * * * * * * * * *
 * Backend Datastore 정의
 *
 */
import { px4_msgs, geometry_msgs, sensor_msgs } from 'rclnodejs';
export type TVehicle = {
    name: string;
    sysId: number;
    uxvType: 'UAV' | 'UGV' | 'USV' | 'GCS';
    color: string;
};
export type TCamera = {
    cameraNumber: string;
    cameraframe: number;
    resolution: {
        width: number;
        height: number;
    };
};
export type TVehicleStatus = {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    roll?: number;
    pitch?: number;
    yaw?: number;
    heading?: number;
    relative_alt?: number;
    speed_x?: number;
    speed_y?: number;
    speed_z?: number;
    gimbal_roll?: number;
    gimbal_pitch?: number;
    gimbal_yaw?: number;
    gimbal_yaw_abs?: number;
};
export type TTrajectoryPoint = {
    timestamp: number;
    position: {
        latitude: number;
        longitude: number;
    };
    altitude: number;
    heading: number;
    attitude: {
        roll: number;
        pitch: number;
        yaw: number;
    };
    gimbal: {
        roll: number;
        pitch: number;
        yaw: number;
        yaw_abs: number;
    };
};
export type TCapturedImage = {
    timestamp: number;
    imagePath: string;
};
export type TSettings = {
    vehicleName: string;
    vehicleType: 'UAV' | 'UGV' | 'USV' | 'GCS';
    vehicleColor: string;
    cameraDevice: string;
    cameraInterface: 'ROS' | 'CAM';
    rosFmuTopicPrefix: string;
};
export type TStatus = {
    cameraConnected: boolean;
    streamConnected: boolean;
    latestCaptureTime: Date;
};
export type TVehicleDatastore = {
    vehicle: TVehicle | null;
    camera: TCamera | null;
    armingTime: number | null;
    vehicleStatus: TVehicleStatus | null;
    trajectory: TTrajectoryPoint[];
    captureImages: TCapturedImage[];
    settings: TSettings;
};
export interface IVehicleDatastoreAction {
    updateVehicleInfo(vehicle: TVehicle): void;
    updateRos2VehicleStatus(ros2Data: px4_msgs.msg.VehicleStatus): void;
    updateRos2VehicleAttitude(ros2Data: px4_msgs.msg.VehicleAttitude): void;
    updateRos2SensorGps(ros2Data: px4_msgs.msg.SensorGps): void;
    updateRos2VehicleLocalPosition(ros2Data: px4_msgs.msg.VehicleLocalPosition): void;
    updateRos2GimbalAttitude(ros2Data: geometry_msgs.msg.Vector3Stamped): void;
    updateRos2CameraStream(ros2Data: sensor_msgs.msg.Image): void;
    loadSettings(): void;
}
export interface IImageTaggingData {
    LAT: number;
    LON: number;
    ALT: number;
    ROLL: number;
    PITCH: number;
    YAW: number;
    HEADING: number;
    REL_ALT: number;
    VX: number;
    VY: number;
    VZ: number;
    GIMBAL_Q: string;
    GIMBAL_X: number;
    GIMBAL_Y: number;
    GIMBAL_Z: number;
}
//# sourceMappingURL=datastore.types.d.ts.map
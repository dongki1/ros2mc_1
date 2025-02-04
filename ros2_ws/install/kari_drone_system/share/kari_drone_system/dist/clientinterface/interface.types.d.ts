export type IVechileRestResponse = IVehicleInfoResponse | IVehicleCommandResponse;
/** * * * * * * * * * * * * * * * * * * * * * *
 *  REST API에 대한 Request parameter/body/...
 *  REST API에 대한 응답
 *
 * GET /api/vehicle
 *
 */
export interface IVehicleInfoResponse {
    vehicle: null | IVehicle;
    camera: null | ICamera;
    vehicleStatus: null | IVehicleStatus;
    trajectory: null | ITrajectory;
    captures: null | ICaptures;
}
export interface IVehicleCommandResponse {
    command: string;
    result: string;
}
export interface IVehicle {
    name: string;
    sysId: number;
    uxvType: 'UAV' | 'UGV' | 'USV' | 'GCS';
    color: string;
}
export interface ICamera {
    cameraNumber: string;
    cameraframe: number;
    resolution: {
        width: number;
        height: number;
    };
}
export interface IVehicleStatus {
    armingTime: number | null;
    position: [number, number] | null;
    altitude: number;
    heading: number;
    attitude: [number, number, number] | null;
    gimbal: [number, number, number, number] | null;
}
export interface ITrajectory {
    timestamp: number[];
    path: [number, number][][] | null;
    altitude: number[];
    heading: number[];
    attitude: [number, number, number][];
    gimbal: [number, number, number, number][];
}
export interface ICaptures {
    timestamp: number[];
    imagePath: string[];
}
export declare const CNotificationEventType: {
    VEHICLE_CONNECTED: string;
    VEHICLE_DISCONNECTED: string;
    VEHICLE_ARMED_DISARMED: string;
    VEHICLE_STATUS_UPDATED: string;
    VEHICLE_IMAGE_CAPTURED: string;
};
export interface IVehicleConnectMessage {
    timestamp: number;
    vehicle: IVehicle;
    camera: ICamera;
}
export interface IVehicleDisconnectMessage {
    timestamp: number;
    vehicle: IVehicle;
}
export interface IVehicleArmDisarmMessage {
    timestamp: number;
    armed: boolean;
}
export interface IVehicleStatusUpdatedMessage {
    timestamp: number;
    vehicleStatus: IVehicleStatus;
}
export interface IVehicleImageChapturedMessage {
    timestamp: number;
    sortie: string;
    imagePath: string;
}
//# sourceMappingURL=interface.types.d.ts.map
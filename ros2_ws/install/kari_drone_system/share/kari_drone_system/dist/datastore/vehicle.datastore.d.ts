/// <reference types="node" />
/// <reference types="node" />
import type { TVehicle, TCamera, TVehicleStatus, TTrajectoryPoint, TCapturedImage, TSettings } from './datastore.types';
import type { IVehicleDatastoreAction } from './datastore.types';
import { px4_msgs, geometry_msgs, sensor_msgs } from 'rclnodejs';
declare class VehicleDatastore implements IVehicleDatastoreAction {
    EVENT_TYPES: {
        EVENT_ARMED: string;
        EVENT_DISARMED: string;
        EVENT_IMAGE_CAPTURED: string;
        EVENT_IMAGE_CAPTURED_BUFFER: string;
        EVENT_STATUS_UPDATED: string;
    };
    private _datastore;
    private _loaded;
    private _eventEmitter;
    vehicle(): TVehicle | null;
    camera(): TCamera | null;
    armingTime(): number | null;
    vehicleStatus(): TVehicleStatus | null;
    trajectory(): TTrajectoryPoint[];
    captureImages(): TCapturedImage[];
    settings(): TSettings;
    vehicleName(): string | null;
    on(event: string, listener: any): void;
    updateVehicleInfo(vehicle: TVehicle): void;
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
    updateRos2VehicleStatus(ros2Data: px4_msgs.msg.VehicleStatus): void;
    loadSettings(): void;
    /**
     * 주어진 vehicleStatus에서 trajectory 에 저장할 정보를 추출하여 trajectory에 추가.
     * TODO: 특정 시간 간격을 두고 trajectory에 추가하는게 필요할지 여부를 고려해야 한다.
     *
     * @param vehicleStatus
     */
    private _updateVehicleStatus;
    /**
     * 시간값을 YYYYMMDDhhmmssSSS 형식의 문자열로 변환
     * @param captureTime
     */
    private _getImageFileName;
    /**
     *
     * @param image
     * @returns
     */
    private _updateCaptureImage;
    /**
   *
   * @param image
   * @returns
   */
    private _updateCaptureImage2;
    /**
     * 쿼터니언 형식의 드론 자세 정보를 roll pitch yaw 값으로 변환하는 함수
     *
     * @param quat Quaternion rotation from the FRD body frame to the NED earth frame
     * @returns [roll:number, pitch:number, yaw:number]
     */
    private _getEulerAttitude;
    /**
     * _vehicleStatus의 attitude 정보를 업데이트하고,
     * 업데이트된 _vehicleStatus를 기준으로 _trajectory에 추가.
     *
     * @param ros2Data
     */
    updateRos2VehicleAttitude(ros2Data: px4_msgs.msg.VehicleAttitude): void;
    /**
     * _vehicleStatus의 gps sencor 정보를 업데이트하고,
     * 업데이트된 _vehicleStatus를 기준으로 _trajectory에 추가.
     *
     * @param ros2Data
     */
    updateRos2SensorGps(ros2Data: px4_msgs.msg.SensorGps): void;
    /**
     * _vehicleStatus의 local position 정보를 업데이트하고,
     * 업데이트된 _vehicleStatus를 기준으로 _trajectory에 추가.
     *
     * @param ros2Data
     */
    updateRos2VehicleLocalPosition(ros2Data: px4_msgs.msg.VehicleLocalPosition): void;
    updateRos2GimbalAttitude(ros2Data: geometry_msgs.msg.Vector3Stamped): void;
    protected _getTaggingData(captureTime: Date): string;
    _toArrayBuffer(buffer: Buffer): Uint8Array;
    updateRos2CameraStream(ros2Data: sensor_msgs.msg.Image): void;
    updateWebcamCameraStream(width: number, height: number, imagePath: string): void;
}
declare const droneDatastore: VehicleDatastore;
export default droneDatastore;
//# sourceMappingURL=vehicle.datastore.d.ts.map
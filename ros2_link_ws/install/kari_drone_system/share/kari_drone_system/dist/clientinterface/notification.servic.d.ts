import { Server } from 'socket.io';
import type { IVehicleConnectMessage, IVehicleDisconnectMessage, IVehicleArmDisarmMessage, IVehicleStatusUpdatedMessage, IVehicleImageChapturedMessage, IVehicleStatus, IVehicle } from './interface.types';
declare class NotificationService {
    private _io;
    private _clientSockets;
    constructor();
    /**
     */
    start(io: Server): void;
    notifyAll(event: string, message: any): void;
    notifyVehicleMessage(event: string, message: IVehicleConnectMessage | IVehicleDisconnectMessage | IVehicleArmDisarmMessage | IVehicleStatusUpdatedMessage | IVehicleImageChapturedMessage): void;
    notifyVehicleConnected(timestamp: number, vehicle: IVehicle): void;
    notifyVehicleDisconnected(timestamp: number, vehicle: IVehicle): void;
    notifyVehicleArmingStateChanged(timestamp: number, armed: boolean): void;
    notifyVehicleImageCaptured(timestamp: number, imagePath: string): void;
    notifyVehicleStatusChanged(timestamp: number, vehicleStatus: IVehicleStatus): void;
}
declare const notificationService: NotificationService;
export default notificationService;
//# sourceMappingURL=notification.servic.d.ts.map
import type { IVehicleInfoResponse, IVehicleCommandResponse } from '../../clientinterface/interface.types';
declare class DroneController {
    constructor();
    getStoreData(): Promise<{
        status: number;
        result: IVehicleInfoResponse;
    }>;
    wait(time: number): Promise<void>;
    sendVehicleCommand(command: string, params: any): Promise<{
        status: number;
        result: IVehicleCommandResponse;
    }>;
}
declare const droneController: DroneController;
export default droneController;
//# sourceMappingURL=vehicle.controller.d.ts.map
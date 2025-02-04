/// <reference types="node" />
/// <reference types="node" />
import type { IChannel } from './channel.types';
import { TVehicle } from '../datastore/datastore.types';
declare class Ros2Channel implements IChannel {
    private _subscriptionList;
    private _subscriptionTopicHandler;
    private _node;
    private _taggedImagePublisher;
    private _vehicleStatusPublisher;
    private _vehicleCommandPublisher;
    private _stopFlag;
    constructor();
    startChannel(): Promise<void>;
    stopChannel(): Promise<void>;
    isStarted(): boolean;
    publishTaggedImage(buffer: Buffer): void;
    publishVehicleStatus(vehicle: TVehicle, vehicleStatusValues: any): void;
    protected _parseTopic(topic: string): any | null;
    _publishVehicleCommand(command: number, param1: number | undefined, param2: number | undefined, param3: number | undefined, param4: number | undefined, param5: number | undefined, param6: number | undefined, param7: number | undefined): Promise<void>;
    setMode(): Promise<void>;
    arm(): Promise<void>;
    disarm(): Promise<void>;
    takeoff(latitude: number, longitude: number, altitude: number): Promise<void>;
    land(): Promise<void>;
}
declare const ros2Channel: Ros2Channel;
export default ros2Channel;
//# sourceMappingURL=ros2.channel.d.ts.map
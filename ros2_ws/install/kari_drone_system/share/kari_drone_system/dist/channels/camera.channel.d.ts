import type { IChannel } from './channel.types';
declare class CameraChannel implements IChannel {
    private _webcam;
    private _stopFlag;
    private _webcamOptions;
    private _imageSequence;
    constructor();
    startChannel(): Promise<void>;
    capture(): Promise<void>;
    stopChannel(): Promise<void>;
    isStarted(): boolean;
}
declare const cameraChannel: CameraChannel;
export default cameraChannel;
//# sourceMappingURL=camera.channel.d.ts.map
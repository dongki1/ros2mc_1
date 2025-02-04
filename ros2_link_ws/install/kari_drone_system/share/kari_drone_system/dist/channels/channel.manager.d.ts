declare class ChannelManager {
    private _channels;
    constructor();
    startChannels(): void;
    sendRos2ArmCommand(): Promise<void>;
    sendRos2DisarmCommand(): Promise<void>;
    sendRos2TakeoffCommand(): Promise<void>;
    sendRos2LandCommand(): Promise<void>;
}
declare const channelManager: ChannelManager;
export default channelManager;
//# sourceMappingURL=channel.manager.d.ts.map
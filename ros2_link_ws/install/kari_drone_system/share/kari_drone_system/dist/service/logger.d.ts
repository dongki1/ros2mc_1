import "moment-timezone";
import "winston-daily-rotate-file";
declare class Logger {
    logger: any;
    tag: string;
    constructor(tag: string);
    debug(...args: any[]): void;
    info(...args: any[]): void;
    error(...args: any[]): void;
}
export { Logger };
//# sourceMappingURL=logger.d.ts.map
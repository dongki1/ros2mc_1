"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const logDir = path_1.default.join(__dirname, '../../logs');
try {
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
}
catch (ex) {
    console.log('[ERROR] Cannot create log folder.', ex.toString());
}
const infoTransport = new winston_1.default.transports.DailyRotateFile({
    filename: "info.log",
    dirname: logDir,
    level: "info",
    maxFiles: "30d", // 30일치 저장
});
const debugTransport = new winston_1.default.transports.DailyRotateFile({
    filename: "debug.log",
    dirname: logDir,
    level: "debug",
    maxFiles: "30d", // 30일치 저장
});
const errorTransport = new winston_1.default.transports.DailyRotateFile({
    filename: "error.log",
    dirname: logDir,
    level: "error",
    maxFiles: "30d", // 30일치 저장
});
const debugConsoleTransport = new winston_1.default.transports.Console({
    level: 'debug',
    format: winston_1.default.format.combine(
    // winston.format.label({ label: '[my-server]' }),
    winston_1.default.format.timestamp({
        format: 'MM-DD HH:mm:ss'
    }), winston_1.default.format.colorize(), 
    // winston.format.simple() // ,
    winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}:${info.message}`))
});
moment_1.default.tz.setDefault("Asia/Seoul"); // 로그 시간대 한국 기준으로 변경
const timeStamp = () => (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
const logger = winston_1.default.createLogger({
    transports: [debugConsoleTransport /*, infoTransport, debugTransport, errorTransport*/],
});
class Logger {
    constructor(tag) {
        this.tag = tag;
        this.logger = logger;
    }
    debug(...args) {
        args.unshift(`[${this.tag}]`);
        logger.debug(args);
    }
    info(...args) {
        args.unshift(`[${this.tag}]`);
        logger.info(args);
    }
    error(...args) {
        args.unshift(`[${this.tag}]`);
        logger.error(args);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map
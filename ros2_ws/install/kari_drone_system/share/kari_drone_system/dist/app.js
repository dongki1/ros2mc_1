"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router_1 = __importDefault(require("./router"));
const vehicle_datastore_1 = __importDefault(require("./datastore/vehicle.datastore"));
vehicle_datastore_1.default.loadSettings();
const notification_servic_1 = __importDefault(require("./clientinterface/notification.servic"));
const channel_manager_1 = __importDefault(require("./channels/channel.manager"));
const app = (0, express_1.default)();
const { serverPort } = require('../settings.json');
const port = serverPort ? parseInt(serverPort) : 3100;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' }
});
notification_servic_1.default.start(io);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use('/', express_1.default.static(path_1.default.join(process.cwd(), '../client/dist')));
// app.use('/assets', express.static(path.join(process.cwd(), '../client/src/assets')));
app.use('/SORTIE', express_1.default.static(path_1.default.join(process.cwd(), 'SORTIE')));
app.use('/api', router_1.default);
io.on('connection', (socket) => {
    console.log('a socket connected', socket.id);
    socket.on('disconnect', () => {
        console.log('a socket disconnected');
    });
});
httpServer.listen(port, '0.0.0.0', () => {
    console.log(`app listening on port ${port}`);
    channel_manager_1.default.startChannels();
});
process.on('SIGINT', function () {
    console.log("Caught interrupt signal");
    process.exit();
});
//# sourceMappingURL=app.js.map
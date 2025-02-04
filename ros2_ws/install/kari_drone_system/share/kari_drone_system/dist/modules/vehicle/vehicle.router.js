"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_controller_1 = __importDefault(require("./vehicle.controller"));
const router = express_1.default.Router();
/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *  실시간 드론 모니터
 */
/**
 * 드론 관련 전체 datastore 조회
 */
router.get('/', async (req, res) => {
    try {
        const { status, result } = await vehicle_controller_1.default.getStoreData();
        res.status(status).json(result);
    }
    catch (ex) {
        res.status(500).send(ex.message);
    }
});
/**
 * 드론에 vehicle command 요청
 */
router.post('/command', async (req, res) => {
    try {
        const { command, params } = req.body;
        const { status, result } = await vehicle_controller_1.default.sendVehicleCommand(command, params);
        res.status(status).json(result);
    }
    catch (ex) {
        res.status(500).send(ex.message);
    }
});
exports.default = router;
//# sourceMappingURL=vehicle.router.js.map
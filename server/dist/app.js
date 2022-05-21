"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const hexRgb_1 = __importDefault(require("./hexRgb"));
// HTTP server
const app = (0, express_1.default)();
dotenv_1.default.config();
const server = http_1.default.createServer(app);
// Database connection
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432")
});
const connectToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pool.connect();
    }
    catch (err) {
        console.log(err);
    }
});
connectToDB().then(() => {
    console.log("Connected to DB");
});
// WebSocket server
const wss = new ws_1.default.Server({ server });
wss.on('connection', (ws) => {
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Received message: ${message}`);
        let request;
        try {
            request = JSON.parse(message);
        }
        catch (e) {
            console.error(`Error when trying to parse message to json : ${message}`);
            console.error(e);
            return;
        }
        console.log(`Request parsed to JSON`);
        console.log(request);
        yield pool.query('SELECT * FROM palettes ORDER BY random() LIMIT 2', (err, result) => {
            let palettes = {};
            result.rows.map((palette) => {
                palettes[palette["id"]] = {
                    id: palette.id,
                    title: palette.title,
                    colors: palette.colors.map((color) => (0, hexRgb_1.default)(color)),
                    downloads: palette.downloads,
                    description: palette.description,
                };
            });
            ws.send(JSON.stringify(palettes));
        });
    }));
});
// Start the server
server.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`);
});

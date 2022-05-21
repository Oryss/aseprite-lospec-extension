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
const axios_1 = __importDefault(require("axios"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const fetchPalettes = (page) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios_1.default.get(`https://lospec.com/palette-list/load?colorNumberFilterType=any&colorNumber=8&page=${page}&tag=&sortingType=default`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,fr;q=0.8",
            "if-none-match": "W/\"3a2a-MCtMet3ioFy86LQI9vKM22FKSdo\"",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "Referer": "https://lospec.com/palette-list",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "method": "GET"
    });
});
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    dotenv_1.default.config();
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
    yield connectToDB();
    return pool;
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const pool = yield init();
    // Get page 0 to calculate the total amount of pages
    const response = yield fetchPalettes(0);
    const totalPages = Math.ceil(response.data.totalCount / 10);
    // Get all the palettes
    for (let i = 0; i < totalPages; i++) {
        console.log(`Fetching page ${i}`);
        yield sleep(5000);
        const response = yield fetchPalettes(i);
        const palettes = response.data.palettes;
        for (const palette of palettes) {
            const query = `INSERT INTO palettes (
                      id,
                      tags,
                      colors,
                      downloads,
                      hidden,
                      featured,
                      is_new,
                      likes,
                      comments,
                      approval,
                      title,
                      hashtag,
                      description,
                      creator,
                      slug,
                      published_at,
                      user_name,
                      user_slug,
                      number_of_colors,
                      created_at,
                      updated_at,
                      v,
                      colors_array,
                      min_width,
                      height,
                      thumbnail_width
                      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`;
            const values = [
                palette._id,
                palette.tags,
                palette.colors,
                parseInt(palette.downloads, 10),
                palette.hidden,
                palette.featured,
                palette.isNew,
                palette.likes,
                palette.comments,
                palette.approval,
                palette.title,
                palette.hashtag,
                palette.description,
                palette.creator,
                palette.slug,
                palette.publishedAt,
                (_a = palette.user) === null || _a === void 0 ? void 0 : _a.name,
                (_b = palette.user) === null || _b === void 0 ? void 0 : _b.slug,
                palette.numberOfColors,
                palette.createdAt,
                palette.updatedAt,
                palette.__v,
                palette.colorsArray,
                palette.minWidth,
                palette.height,
                palette.thumbnailWidth
            ];
            yield pool.query(query, values, (err, res) => {
                if (err) {
                    console.error("Error inserting palette: ", palette);
                    console.error(err);
                }
                if (res) {
                    console.log(`Inserted palette ${palette.title}`);
                }
            });
        }
    }
}))();

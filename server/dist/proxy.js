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
exports.search = void 0;
const axios_1 = __importDefault(require("axios"));
const headers = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,fr;q=0.8",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "Referer": "https://lospec.com/palette-list/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};
const search = (colorNumberFilterType = "any", colorNumber, tag, sortingType = "default", page = 0) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios_1.default.get(`https://lospec.com/palette-list/load`, {
        "headers": headers,
        "params": {
            colorNumberFilterType,
            colorNumber,
            page,
            tag,
            sortingType
        }
    });
});
exports.search = search;

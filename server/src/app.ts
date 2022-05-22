import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from "dotenv";
import { Pool } from "pg";
import hexRgb from "./hexRgb";
import { search } from "./proxy";

// HTTP server
const app = express();
dotenv.config();
const server = http.createServer(app);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432")
});

const connectToDB = async () => {
  try {
    await pool.connect();
  } catch (err) {
    console.log(err);
  }
};

connectToDB().then(() => {
  console.log("Connected to DB");
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', async (message: string) => {
    console.log(`Received message: ${message}`);
    let request;
    try {
      request = JSON.parse(message);
    } catch (e) {
      console.error(`Error when trying to parse message to json : ${message}`);
      console.error(e);
      return;
    }

    console.log(`Request parsed to JSON`);
    console.log(request);

    try {
      const response = await search(request);

      // Before sending response, we must convert all hexadecimal colors to RGB because Aseprite does not support hexa
      const responseWithRgb = {
        type: "search",
        ...response.data,
        palettes: response.data.palettes.map((palette: any) => ({
          ...palette,
          colors: palette.colors.map((color: any) => hexRgb(color)),
          colorsArray: palette.colorsArray.map((colorsArray: any) => hexRgb(colorsArray))
        }))
      }

      ws.send(JSON.stringify(responseWithRgb));
    } catch (e) {
      console.error(e);
      ws.send(JSON.stringify({
        status: "error",
        message: "Could not get result from Lospec's website"
      }));
    }
  });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});

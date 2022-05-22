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

interface Color {
  red: number,
  green: number,
  blue: number,
  alpha: any,
}

interface Palette {
  id: string,
  title: string,
  colors: Array<Color>,
  downloads: number,
  description: string,
}

interface Palettes {
  [key: string]: Palette
}

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
      ws.send(JSON.stringify(response.data));
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

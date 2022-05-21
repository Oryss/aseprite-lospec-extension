import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from "dotenv";
import { Pool } from "pg";
import hexRgb from "./hexRgb";

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

interface PaletteDB {
  id: string,
  title: string,
  colors: Array<string>,
  downloads: number,
  description: string,
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

    await pool.query('SELECT * FROM palettes ORDER BY random() LIMIT 2', (err, result) => {

      let palettes: Palettes = {};
      result.rows.map((palette: PaletteDB) => {
        palettes[palette["id"]] = {
          id: palette.id,
          title: palette.title,
          colors: palette.colors.map((color: string): Color => <Color>hexRgb(color)),
          downloads: palette.downloads,
          description: palette.description,
        };
      });

      ws.send(JSON.stringify(palettes));
    })
  });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});

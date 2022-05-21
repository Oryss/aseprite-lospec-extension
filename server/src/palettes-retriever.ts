import axios from "axios";
import { Pool } from "pg";
import dotenv from "dotenv";

const fetchPalettes = async (page: number) => {
    return await axios.get(`https://lospec.com/palette-list/load?colorNumberFilterType=any&colorNumber=8&page=${page}&tag=&sortingType=default`, {
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
}

const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const init = async () =>{
    dotenv.config();
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
    await connectToDB();

    return pool;
}

(async () => {
    const pool = await init();

    // Get page 0 to calculate the total amount of pages
    const response = await fetchPalettes(0);
    const totalPages = Math.ceil(response.data.totalCount / 10);

    // Get all the palettes
    for (let i = 0; i < totalPages; i++) {
        console.log(`Fetching page ${i}`);

        await sleep(5000);

        const response = await fetchPalettes(i);
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
                        palette.user?.name,
                        palette.user?.slug,
                        palette.numberOfColors,
                        palette.createdAt,
                        palette.updatedAt,
                        palette.__v,
                        palette.colorsArray,
                        palette.minWidth,
                        palette.height,
                        palette.thumbnailWidth
                    ];

                    await pool.query(query, values, (err, res) => {
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

})();

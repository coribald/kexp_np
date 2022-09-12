import * as dotenv from 'dotenv';
dotenv.config();

export const kexp_const = {
   URL: "https://api.kexp.org",
   TRACK_ENDPOINT: "/play?format=json&limit=1",
   SHOW_ENDPOINT: "/show?format=json&limit=1&showid=",
   AIR_BREAK: 4
}

export const twitter_config = {
   CLIENT_ID: "YOUR_CLIENT_ID",
   CLIENT_SECRET: "YOUR_CLIENT_SECRET",
   REFRESH_TOKEN: process.env.REFR_TOKEN //Complete oauth2 flow outside of app and store initial refresh token in .env
};
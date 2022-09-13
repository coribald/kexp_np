//KEXP API values
export const kexp_config = {
   URL: "https://api.kexp.org",
   TRACK_ENDPOINT: "/play?format=json&limit=1",
   SHOW_ENDPOINT: "/show?format=json&limit=1&showid=",
   AIR_BREAK: 4,
   TRACK_FILE: '/data/last_track.json'
}

//Twitter oauth2 client keys
export const twitter_config = {
   CLIENT_ID: "YOUR_CLIENT_ID",
   CLIENT_SECRET: "YOUR_CLIENT_SECRET",
   TOKEN_FILE: '/data/.token' //create oauth2 refresh token outside of app and save here
};
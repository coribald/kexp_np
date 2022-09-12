import * as fs from 'fs';
import axios from 'axios';
import { kexp_const } from './config.js';

//Initialize HTTP client
const kexp = axios.create({
   baseURL: kexp_const.URL,
   timeout: 8000,
   headers: {'Accept': 'application/json'}
});

//Get current track from KEXP API
export async function getCurrentTrack() {
   let endpoint = kexp_const.TRACK_ENDPOINT;
   let response = await kexp.get(endpoint);
   if (response.status === 200) {
      //Only proceed if not an air break
      if (response.data.results[0].playtype.playtypeid != kexp_const.AIR_BREAK) {
         return response.data.results[0];
      }
      else {
         return kexp_const.AIR_BREAK;
      }
   }
   return false;
}

//Get current show from KEXP API
export async function getCurrentShow(showId) {
   let endpoint = kexp_const.SHOW_ENDPOINT + showId;
   let response = await kexp.get(endpoint);
   if (response.status === 200) {
      let show = {};
      show.name = response.data.results[0].program.name.toString();
      show.host = response.data.results[0].hosts[0].name.toString();
      //Attempt to get and process show genres, but proceed anyway if we can't
      if (response.data.results[0].program.tags) {
         let tags_arr = response.data.results[0].program.tags.split(",");
         for (var i = 0; i < tags_arr.length; i ++) {
            if(tags_arr[i] == "DJ" || tags_arr[i] == "KEXP") {
               tags_arr.splice(i,1);
               i--;
            }
         }
         if(tags_arr.length > 0) {
            show.tags = tags_arr.join(", ");
         }
      }
      if (show.name && show.host) {
         return show;
      }
   }
   return false;
}

//Write out track JSON to file
export async function writeTrackToFile(trackToWrite) {
   let file_update = fs.writeFileSync('last_track.json', trackToWrite);
   if (file_update) {
      return true;
   }
   return false;
}

//Read in track JSON from file
export async function readTrackFromFile() {
   let file_read = fs.readFileSync('last_track.json');
   if (file_read) {
      let file_parsed = JSON.parse(file_read);
      return file_parsed;
   }
   return false;
}

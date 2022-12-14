//KEXP Now Playing JS 1.0 by coribald
//updated 2022-09-12
import * as twitter from './twitter_helper.js';
import * as kexp from './kexp_helper.js';
import { twitter_config, kexp_config } from './config.js';

let client = '';
let current_track = '';
let previous_track = '';
let previous_tweet_str = '';

setInterval(async () => {
   const result = await tweetPlaylist(); //Main function
   writeLogMsg(result);
   writeLogMsg("END");
},30000);

async function tweetPlaylist() {
   writeLogMsg("START");
   //Refresh Token and auth to Twitter
   try {
      client = await twitter.refreshToken(twitter_config.CLIENT_ID, twitter_config.CLIENT_SECRET, twitter_config.TOKEN_FILE);
      if (!client) {
         throw new Error("Oauth refresh failed for unclear reasons");
      } //Bail out if we somehow passed the refresh with no data
   } catch (err) {
      return "FAILURE: Error refreshing Twitter oauth2 token: " + err;
   }

   //Get current track details from KEXP API
   try {
      current_track = await kexp.getCurrentTrack();
      if (current_track === kexp_config.AIR_BREAK) {
         return "INFO: Received Air Break from API. Not Proceeding.";
      }
      else if (!current_track) {
         throw new Error("Getting track from API failed for unclear reasons");
      }
   } catch (err) {
      return "FAILURE: Error fetching latest playlist item from KEXP: " + err;
   }

   //Read in last track from file
   try {
      previous_track = await kexp.readTrackFromFile(kexp_config.TRACK_FILE);
      if (!previous_track) {
         throw new Error("Getting track from file failed for unclear reasons");
      }
   } catch (err) {
      return "FAILURE: Error fetching previous playlist item from file: " + err;
   }

   //If track hasn't changed, bail out.
   if (previous_track.playid === current_track.playid) {
      return "INFO: Track hasn't changed yet. Nothing to do.";
   }

   //If show has changed, get show info from API and tweet details
   if (previous_track.showid < current_track.showid) {
      let show_string = 'NOW ON AIR: ';
      try {
         writeLogMsg("INFO: New show detected!");
         let current_show = await kexp.getCurrentShow(current_track.showid);
         let show_name = current_show.name.toString();
         let show_host = current_show.host.toString();
         show_string += show_name + " with " + show_host;
         if (current_show.tags) {
            let show_tags = current_show.tags.toString();
            show_string += " (" + show_tags + ")";
         }
         show_string += " - listen at kexp.org";
         let show_tweet = await twitter.sendTweet(client,show_string);
         writeLogMsg("INFO: Tweeted new show: " + JSON.stringify(show_tweet));
      } catch (err) {
         if (err.error) {
            let err_fixed = JSON.parse(JSON.stringify(err));
            if (err_fixed.code && err_fixed.error.detail) {
               let err_code = err_fixed.code;
               let err_desc = err_fixed.error.detail;
               writeLogMsg("WARNING: Error tweeting new show details. Continuing anyway: " + err_code + " - " + err_desc);
            } else {
               writeLogMsg("WARNING: Error tweeting new show details. Continuing anyway: " + err);
            }
         } else {
            writeLogMsg("WARNING: Error tweeting new show details. Continuing anyway: " + err);
         }
      }
   }

   //Get track info and create string to tweet
   let play_string = '';
   try {
      writeLogMsg("INFO: New track detected!");
      let artist = current_track.artist.name.toString();
      let track = current_track.track.name.toString();
      if (artist && track) {
         play_string += artist + " - " + track;
      }
      else {
         throw new Error("Something went very wrong handling the artist and track strings.");
      }
      //Append album if present
      if (current_track.release && current_track.release.name) {
         let album = current_track.release.name.toString();
         play_string += " - " + album;
      }
      //Append release year if present
      if (current_track.releaseevent && current_track.releaseevent.year) {
         let year = current_track.releaseevent.year.toString();
         play_string += " (" + year + ")";
      }
   } catch (err) {
      return "FAILURE: Error building track info string: " + err;
   }

   //Tweet latest track
   try {
      let track_tweet = await twitter.sendTweet(client,play_string);
      if (!track_tweet) {
         throw new Error("Track Tweet failed for unclear reasons");
      }
      writeLogMsg("INFO: Tweeted new track: " + JSON.stringify(track_tweet));
   } catch (err) {
      if (err.error) {
         let err_fixed = JSON.parse(JSON.stringify(err));
         if (err_fixed.code && err_fixed.error.detail) {
            let err_code = err_fixed.code;
            let err_desc = err_fixed.error.detail;
            //if it's a valid duplicate and not a repeat, try again with an extra ~
            if (err_desc.indexOf('duplicate') > 0 && play_string != previous_tweet_str) {
                  play_string += "  ~";
                  let track_tweet2 = await twitter.sendTweet(client,play_string);
                  writeLogMsg("INFO: Tweeted new track: " + JSON.stringify(track_tweet2));
            } else {
               return "FAILURE: Error tweeting new track details: " + err_code + " - " + err_desc;
            }
         } else {
            return "FAILURE: Error tweeting new track details: " + err;
         }
      } else {
         return "FAILURE: Error tweeting new track details: " + err;
      }
   }

   //Write tweeted track to file for reference
   try {
      previous_tweet_str = play_string; //Store previous play string for ref in case of error
      let track_to_file = kexp.writeTrackToFile(JSON.stringify(current_track, null, 3),kexp_config.TRACK_FILE);
      if (!track_to_file) {
         throw new Error("Failed to write latest track to file for unclear reasons. Tweet succeeded. Expect 403s to follow for duplicate tweets.");
      }
   } catch (err) {
      return "FAILURE: Error writing tweeted track to file: " + err + ". Tweet succeded. Expect 403s to follow for duplicate tweets.";
   }
   return "SUCCESS: Latest track retrieved and posted.";
}

//Append timestamps to log messages
function writeLogMsg(msg) {
   console.log(new Date().toISOString() + '::' + msg);
}
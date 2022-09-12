import * as fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';

//Refresh oauth2 token - requires initial oauth2 refresh token generated outside of app
export async function refreshToken(clientId, clientSecret, refreshToken) {
   const refreshClient = new TwitterApi({ clientId: clientId, clientSecret: clientSecret });
   const newClient = await refreshClient.refreshOAuth2Token(refreshToken);
   if (newClient) {
      writeNewRefreshToken(newClient.refreshToken);
      return newClient.client;
   }
   return false;
}

//Post new tweet
export async function sendTweet(client,stringToTweet) {
   const new_tweet = await client.v2.tweet(stringToTweet);
   if (new_tweet) {
      return new_tweet;
   }
   return false;
}

//Write refreshed refresh token to .env
function writeNewRefreshToken(tokenToWrite) {
   const tokenForFile = "REFR_TOKEN=\"" + tokenToWrite + "\"";
   const file_update = fs.writeFileSync('.env', tokenForFile);
   if (file_update) {
      return true;
   }
   return false;
}
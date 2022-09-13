import * as fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';

//Refresh oauth2 token - requires initial oauth2 refresh token generated outside of app
export async function refreshToken(clientId, clientSecret, tokenFile) {
   const currentToken = getTokenFromFile(tokenFile);
   if (currentToken) {
      const refreshClient = new TwitterApi({ clientId: clientId, clientSecret: clientSecret });
      const newClient = await refreshClient.refreshOAuth2Token(currentToken);
      if (newClient) {
         writeTokenToFile(newClient.refreshToken, tokenFile);
         return newClient.client;
      }
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

//Get refresh token from .token
function getTokenFromFile(tokenFile) {
   let file_read = fs.readFileSync(tokenFile);
   if (file_read) {
      return file_read.toString();
   }
   return false;
}

//Write refreshed refresh token to .token
function writeTokenToFile(tokenToWrite,tokenFile) {
   const file_update = fs.writeFileSync(tokenFile, tokenToWrite);
   if (file_update) {
      return true;
   }
   return false;
}
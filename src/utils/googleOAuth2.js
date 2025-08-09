import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';
import { readFile } from 'fs/promises';
import createHttpError from 'http-errors';

const PATH_JSON = path.join(process.cwd(), 'google-oauth.json');
const oauthConfig = JSON.parse(await readFile(PATH_JSON));
const googleOAuthClient = new OAuth2Client({
  clientId: process.env.GOOGLE_AUTH_CLIENT_ID || oauthConfig.web.client_id,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || oauthConfig.web.client_secret,
  redirectUri: process.env.GOOGLE_AUTH_REDIRECT_URI || oauthConfig.web.redirect_uris[0],
});

export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

export const validateCode = async (code) => {
  const response = await googleOAuthClient.getToken(code);
  if (!response.tokens.id_token)
    throw createHttpError(401, 'No ID token found in response');
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
  });

  return ticket;
};

export const getFullNameFromGoogleTokenPayload = (payload) => {
  let fullName = 'Guest';
  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }

  return fullName;
};

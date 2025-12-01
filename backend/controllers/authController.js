import axios from "axios";
import UserModel from "../models/userModel.js";
import crypto from "crypto";
import { generateToken } from "../lib/generateToken.js";

export const airtableAuth = (req, res) => {
    try{
        const clientId = process.env.AIRTABLE_CLIENT_ID;
        const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

        if(!clientId || !redirectUri) {
            return res.status(500).json({ 
                message: "Missing CLIENT_ID or REDIRECT_URI in environment variables" 
            });
        }

        const codeVerifier = crypto.randomBytes(64).toString("base64url");
        const codeChallenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

        const state = crypto.randomBytes(16).toString("hex");
        
        res.cookie('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 600000 });
        res.cookie('code_verifier', codeVerifier, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 600000 });

        const scope = 'data.records:read data.records:write schema.bases:read webhook:manage';

        const url = new URL('https://airtable.com/oauth2/v1/authorize');

        url.searchParams.set('client_id', clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('code_challenge', codeChallenge);
        url.searchParams.set('code_challenge_method', 'S256');
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', scope);
        url.searchParams.set('state', state);

        res.redirect(url.toString());
    }
    catch(error){
        console.log("Error in airtableAuth:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const airtableCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL;
    const { code, error, state } = req.query;
    
    const savedState = req.cookies.oauth_state;
    const codeVerifier = req.cookies.code_verifier;
    
    if(!savedState || state !== savedState) {
        return res.redirect(`${frontendUrl}/login?error=invalid_state`);
    }

    if(!codeVerifier) {
        return res.redirect(`${frontendUrl}/login?error=missing_verifier`);
    }

    res.clearCookie('oauth_state');
    res.clearCookie('code_verifier');

    if(error) {
        return res.redirect(`${frontendUrl}/login?error=${error}`);
    }

    if(!code) {
        return res.redirect(`${frontendUrl}/login?error=missing_code`);
    }

    try {
        const authString = `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`;
        const header = Buffer.from(authString).toString('base64');

        const response = await axios.post(
            'https://airtable.com/oauth2/v1/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
                code_verifier: codeVerifier,       
            }),
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${header}`
                },
            }
        );

        const { access_token, refresh_token, expires_in } = response.data;

        const user = await axios.get('https://api.airtable.com/v0/meta/whoami', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const newUser = await UserModel.findOneAndUpdate(
            { airtableUserId: user.data.id },
            {
                airtableUserId: user.data.id,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiry: new Date(Date.now() + expires_in * 1000)
            },
            { upsert: true, new: true }
        );

        const token = generateToken(newUser._id);
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 5 * 24 * 60 * 60 * 1000 });

        res.redirect(`${frontendUrl}/auth/callback?auth=success`);
    }
    catch(error) {
        console.log("Error in airtableCallback:", error);
        res.redirect(`${frontendUrl}/login?error=internal_error`);
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select('-accessToken -refreshToken -__v');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.log('Error in checkAuth:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log('Error in logout:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



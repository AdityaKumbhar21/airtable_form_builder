import axios from "axios";
import UserModel from "../models/userModel.js";


export const airtableRefreshToken = async (req, res, next) => {
    if(!req.user?.accessToken) return next();

    const user = await UserModel.findById(req.user._id);

    if(!user){
        res.status(401).json({
            message: "User not found"
        })
    }

    if(user.tokenExpiry && user.tokenExpiry > new Date(Date.now() + 5 * 60 *1000)){
        req.user.accessToken = user.accessToken;
        return next()
    }

    try{
        // Create Basic auth header with client credentials
        const authString = `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`;
        const authHeader = Buffer.from(authString).toString('base64');

        const response = await axios.post(
        'https://airtable.com/oauth2/v1/token',
        new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken,
        }).toString(),
        {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authHeader}`
            },
        }
        );

        const { access_token, refresh_token, expires_in } = response.data;
        user.accessToken = access_token;
        user.refreshToken = refresh_token || user.refreshToken;
        user.tokenExpiry = new Date(Date.now() + expires_in * 1000);
        await user.save();

        req.user.accessToken = access_token;
        next();
    }
    catch(error){
        console.log('Token refresh failed:', error);
        return res.status(401).json({ message: 'Session expired, please log in again' });
    }

}
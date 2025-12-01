import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

export const isUserLoggedIn = async (req, res, next) => {
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        else if(req.cookies?.token){
            token = req.cookies.token;
        }

        if(!token){
            return res.status(401).json({message: 'Unauthorized: No token provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id).select('+refreshToken +accessToken');

        if(!user){
            return res.status(401).json({
                message: 'Unauthorized: User not found'
            });
        }
        
        req.user = user;
        next();

    }
    catch(error){
        console.error('Error in isUserLoggedIn middleware:', error);
        return res.status(401).json({
            message: 'Unauthorized: Invalid token'
        });
    }

}
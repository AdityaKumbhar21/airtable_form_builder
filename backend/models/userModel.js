import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    airtableUserId: {
        type: String,
        required: true,
        unique: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    tokenExpiry:{
        type: Date,
        required: true
    }
}, {timestamps: true})

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
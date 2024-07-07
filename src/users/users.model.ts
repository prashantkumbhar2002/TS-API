import { Document, Schema, model} from "mongoose";
// import { User } from "./user.types";
import  jwt  from "jsonwebtoken";
import { config } from "../config/config";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}


const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
},
{ timestamps: true })



userSchema.methods.isPasswordCorrect = async function(this: IUser, password: string) {
    return await bcrypt.compare(password, this.password) 
}

userSchema.methods.generateAccessToken = function(this: IUser){
    console.log(this._id)
    return jwt.sign({_id: this._id }, config.accessTokenSecret as string, { expiresIn: config.accessTokenExpiry})
}

userSchema.methods.generateRefreshToken = function(this: IUser){
    return jwt.sign({_id: this._id }, config.refreshTokenSecret as string, { expiresIn: config.refreshTokenExpiry})
}
export const User = model<IUser>('User', userSchema);
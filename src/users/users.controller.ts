import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors";
import { User, IUser } from "./users.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from "../config/config";
import { spawn } from "child_process";
// import { User } from "./user.types";

export interface AuthenticatedRequest extends Request {
    user?: IUser;
}
const generateAccessAndRefreshTokens = async (userId: any) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, 'User not found');
        }
        const accessToken = await user?.generateAccessToken();
        const refreshToken = await user?.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        return createHttpError(500, 'Error while generating tokens')
    }
}

const registerUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password){
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    try {
        const user = await User.findOne({ email });
        if(user){
            const error = createHttpError(400, "User already exists with this email");
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, 'Error while fetching the user'))
    }

    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    try {
        newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });
    } catch (error) {
        return next(createHttpError(500, 'Error while creating new User'))
    }

    // if(!newUser){
    //     const error = createHttpError(500, 'Error while saving details of User');
    //     return next(error);
    // }

    //token generation
    // const token = jwt.sign( {sub: newUser._id }, config.accessTokenSecret as string, { expiresIn: config.accessTokenExpiry})
    res.status(201).json({message: "User Registered Successfully", newUser});
}


const loginUsers = async (req:AuthenticatedRequest, res: Response, next:NextFunction) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(createHttpError(400, 'All fields are required'));
    }
    try {
        let user = await User.findOne({email});
        if(!user){
            return next(createHttpError(404, 'User not found!'));
        }
        // const isPasswordCorrect = await bcrypt.compare(password, user.password);
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if(!isPasswordCorrect){
            return next(createHttpError(401, 'Incorrect Password'));
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select('-password -refreshToken')
        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: 'User logged in Successfully', loggedInUser})
        // try {
            // const token = jwt.sign( {sub: user._id }, config.accessTokenSecret as string, { expiresIn: config.accessTokenSecret, algorithm: 'HS256'})
            // res.status(200).json({message: "User logged in Successfully", accessToken: token})
        // } catch (error) {
        //     return next(createHttpError(500, 'Error while generating token'))
        // }
    } catch (error) {
        return next(createHttpError(500, 'Error while login user'));
    }
    
}
export { registerUsers, loginUsers };
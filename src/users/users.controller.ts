import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors";
import userModel from "./users.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from "../config/config";
import { User } from "./user.types";

const registerUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password){
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    try {
        const user = await userModel.findOne({ email });
        if(user){
            const error = createHttpError(400, "User already exists with this email");
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, 'Error while fetching the user'))
    }

    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser: User;
    try {
        newUser = await userModel.create({
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
    const token = jwt.sign( {sub: newUser._id }, config.jwtSecret as string, { expiresIn: config.jwtExpiry})
    res.status(201).json({message: "User Registered Successfully", accessToken: token});
}


const loginUsers = async (req:Request, res: Response, next:NextFunction) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(createHttpError(400, 'All fields are required'));
    }
    try {
        let user = await userModel.findOne({email});
        if(!user){
            return next(createHttpError(404, 'User not found!'));
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return next(createHttpError(401, 'Incorrect Password'));
        }
        try {
            const token = jwt.sign( {sub: user._id }, config.jwtSecret as string, { expiresIn: config.jwtExpiry, algorithm: 'HS256'})
            res.status(200).json({message: "User logged in Successfully", accessToken: token})
        } catch (error) {
            return next(createHttpError(500, 'Error while generating token'))
        }
    } catch (error) {
        return next(createHttpError(500, 'Error while login user'));
    }
    
}
export { registerUsers, loginUsers };
import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors";
import userModel from "./users.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from "../config/config";

const registerUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password){
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }
    const user = await userModel.findOne({ email });
    if(user){
        const error = createHttpError(400, "User already exists with this email");
        return next(error);
    }

    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword
    });

    if(!newUser){
        const error = createHttpError(500, 'Error while saving details of User');
        return next(error);
    }

    //token generation
    const token = jwt.sign( {sub: newUser._id }, config.jwtSecret as string, { expiresIn: config.jwtExpiry})
    res.status(201).json({message: "User Registered Successfully", accessToken: token});
}


export { registerUsers };
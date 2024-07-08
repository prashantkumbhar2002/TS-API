import { Request, Response, NextFunction } from "express";
import { IUser, User } from "../users/users.model";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const verifyJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token: string | undefined = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken;
        if(!token){
            return next(createHttpError(401, 'Unauthorized Request'))
        }
        const decodedToken = jwt.verify(token, config.accessTokenSecret as string) as JwtPayload
        const user: IUser | null = await User.findById(decodedToken?._id).select("-password -refreshToken").lean().exec()
        if(!user){
            return next(createHttpError(401, 'Invalid Access Token'))
        }
        req.user = user;
        next();

    } catch (error: any) {
        return next(createHttpError(401, error?.message || "Invalid Access Token"));
    }
}
import { config as conf } from "dotenv";
conf();

const _config = {
    PORT: process.env.PORT,
    DB_URL: `${process.env.MONGO_URL}/${process.env.DB_NAME}`,
    env: process.env.NODE_ENV,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    CLOUDINARY_CLOUD: process.env.CLOUDINARY_CLOUD,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

export const config = Object.freeze(_config);   //to make _config obj readOnly
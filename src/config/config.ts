import { config as conf } from "dotenv";
conf();

const _config = {
    PORT: process.env.PORT,
    DB_URL: `${process.env.MONGO_URL}/${process.env.DB_NAME}`,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY,
    CLOUDINARY_CLOUD: process.env.CLOUDINARY_CLOUD,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

export const config = Object.freeze(_config);   //to make _config obj readOnly
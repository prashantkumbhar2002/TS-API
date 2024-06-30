import mongoose from 'mongoose';
import { config } from './config';

const connectDB = async () => {
    try {
        //registering events on DB connection
        mongoose.connection.on('connected', () => {
            console.log(`Database connected successfully!  \nDB host: ${mongoose.connection.host}`)
        })
        
        mongoose.connection.on('error', (err) => {
            console.log('Error while connecting to DB', err)
        })

        //connecting to DB
        await mongoose.connect(config.DB_URL)
    } catch (error) {
        console.error('Failed to connect to DB ', error);   //error while initial connection
        process.exit(1);
    }
}

export default connectDB;
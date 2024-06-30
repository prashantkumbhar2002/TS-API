import app from './src/app';
import { config } from './src/config/config';
import connectDB from './src/config/db';

const createServer = async () => {
    await connectDB();

    const PORT = config.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`⚙️ Server is up and running on port ${PORT}`)
    });
}

createServer();
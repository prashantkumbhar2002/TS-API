import app from './src/app';

const createServer = () => {

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server is up and running on port ${PORT}`)
    });
}

createServer();
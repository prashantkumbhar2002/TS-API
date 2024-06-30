import express from 'express';

const app = express();

//Routes
app.get('/', (req, res, next) => {
    res.json({message: "Hello from Prashant"})
})

export default app;
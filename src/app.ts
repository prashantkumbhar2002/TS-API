import express, { NextFunction, Request, Response } from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app = express();

//Routes
app.get('/', (req, res, next) => {
    res.json({message: "Hello from Prashant"})
})


//middlewares
app.use(globalErrorHandler);  //Error handler function

export default app;
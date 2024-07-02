import express, { NextFunction, Request, Response } from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler';
import userRouter from './users/users.router';

const app = express();
app.use(express.json());

//Routes
app.get('/', (req, res, next) => {
    res.json({message: "Hello from Prashant"})
})

app.use('/api/v1/users', userRouter)


//middlewares
app.use(globalErrorHandler);  //Error handler function

export default app;
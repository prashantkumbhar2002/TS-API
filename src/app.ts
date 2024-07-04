import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/globalErrorHandler';
import userRouter from './users/users.router';
import bookRouter from './books/books.router';

const app = express();
app.use(express.json());
app.use(morgan('tiny'));
//Routes
app.get('/', (req, res, next) => {
    res.json({message: "Hello from Prashant"})
})

app.use('/api/v1/users', userRouter)
app.use('/api/v1/books', bookRouter)


//middlewares
app.use(globalErrorHandler);  //Error handler function

export default app;
import { NextFunction, Request, Response } from "express";

const createBook = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({message: "Book resource created successfully"})
}

export {
    createBook
}
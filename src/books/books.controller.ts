import { NextFunction, Request, Response } from "express";
// import path from "node:path";
import { uploadOnCloudinary } from "../config/cloudinary";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {

    const { title, author, genre } = req.body;

    if(
        [title, author, genre].some((field) => {
          return field?.trim() === "";
        })
    ){
        return next(createHttpError(400, "All fields are required"));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const coverImageFile = files.coverImage[0];
    if(!coverImageFile){
        return next(createHttpError(400, 'CoverImage is missing'))
    }
    const coverImageLocalPath = coverImageFile.path;
    const coverImagefileName = coverImageFile.filename;
    const coverImageMimeType = coverImageFile.mimetype?.split('/')?.at(-1) || coverImageFile.mimetype;
    // const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, coverImagefileName, 'book_covers', coverImageMimeType);

    const bookFile = files.file[0];
    if(!bookFile){
        return next(createHttpError(400, 'Book file is required'))
    }
    const bookLocalPath = bookFile.path;
    const bookfileName = bookFile.filename;
    const bookMimeType = bookFile.mimetype?.split('/')?.at(-1) || bookFile.mimetype;
    const file = await uploadOnCloudinary(bookLocalPath, bookfileName, 'books', bookMimeType);

    
    res.status(200).json({message: "Book resource created successfully", coverImage: coverImage, file: file})
}

export {
    createBook
}
import { NextFunction, Request, Response } from "express";
// import path from "node:path";
import { uploadOnCloudinary } from "../config/cloudinary";
import createHttpError from "http-errors";
import booksModel from "./books.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { config } from "../config/config";

const uploadFile = async (file: Express.Multer.File, type: 'auto' | 'image' | 'video' | 'raw', folder: string, errorMsg: string): Promise<string> => {
    if (!file) {
        throw createHttpError(400, errorMsg);
    }
    const localPath = file.path;
    const fileName = file.filename;
    const mimeType = file.mimetype?.split('/')?.at(-1) || file.mimetype;
    const result = await uploadOnCloudinary(localPath, fileName, folder, type, mimeType);
    if (!result || !result.secure_url) {
        throw createHttpError(500, 'Failed to upload file');
    }
    console.log(JSON.stringify(result));
    return result.secure_url;
};

const createBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    const { title, author, genre } = req.body;

    if(
        [title, author, genre].some((field) => {
          return field?.trim() === "";
        })
    ){
        return next(createHttpError(400, "All fields are required"));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        const coverImageFile = files.coverImage[0];
        // if(!coverImageFile){
        //     return next(createHttpError(400, 'CoverImage is missing'))
        // }
        // const coverImageLocalPath = coverImageFile.path;
        // const coverImagefileName = coverImageFile.filename;
        // const coverImageMimeType = coverImageFile.mimetype?.split('/')?.at(-1) || coverImageFile.mimetype;
        // // const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);
        // const coverImage = await uploadOnCloudinary(coverImageLocalPath, coverImagefileName, 'book_covers', 'image', coverImageMimeType);
    
        const coverImageUrl = await uploadFile(coverImageFile, 'image', config.cloudinaryCoverImageFolder as string, 'Cover Image is missing')

        const bookFile = files.file[0];
        // if(!bookFile){
        //     return next(createHttpError(400, 'Book file is required'))
        // }
        // const bookLocalPath = bookFile.path;
        // const bookfileName = bookFile.filename;
        // const bookMimeType = bookFile.mimetype?.split('/')?.at(-1) || bookFile.mimetype;
        // const file = await uploadOnCloudinary(bookLocalPath, bookfileName, 'books', 'raw', bookMimeType);
        
        const fileUrl = await uploadFile(bookFile, 'raw', config.cloudinaryBookFolder as string, 'Book file is missing');

        const book = await booksModel.create({
            title: title,
            author: req.user?._id,
            genre: genre,
            coverImage: coverImageUrl,
            file: fileUrl
        })
        if(!book){
            return next(createHttpError(500, 'Error while saving book'));
        }
        res.status(200).json({message: "Book resource created successfully", book: book})
    } catch (error) {
        return next(createHttpError(500, 'Error while creating book resource'));
    }
}


const updateBook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    if([title, genre].some((field) => { return field?.trim() === ""})){
        return next(createHttpError(400, 'All fields are required'))
    }
    const { bookId } = req.params;
    if(!bookId){
        return next(createHttpError(400, 'Book ID is missing'));
    }
    const book = await booksModel.findById(bookId);
    if(!book){
        return next(createHttpError(404, 'Book not found'));
    }
    if(book.author.toString() !== req.user?.toString()){
        return next(createHttpError(403, 'Unauthorized'));
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    try {
        let newCoverImage = book.coverImage;
        if(Array.isArray(files.coverImage) && files.coverImage[0]){
            const coverImageFile = files.coverImage[0];
            newCoverImage = await uploadFile(coverImageFile, 'image', config.cloudinaryCoverImageFolder as string, 'Cover Image is missing');
        } 
        let newBookFile = book.file;
        if(Array.isArray(files.file) && files.file[0]){
            const bookFile = files.file[0];
            newBookFile = await uploadFile(bookFile, 'raw', config.cloudinaryBookFolder as string, 'Book file is missing');
        }
        const updatedBook = await booksModel.findOneAndUpdate(
            { _id: bookId}, 
            {
                title: title,
                genre: genre,
                coverImage: newCoverImage,
                file: newBookFile
            },
            {
                new: true
            }
        );
        res.status(200).json({ message: 'Book file updated successfully', updatedBook})
    } catch (error) {
        return next(createHttpError(500, 'Error while updating book file'))
    }
}

export {
    createBook,
    updateBook
}
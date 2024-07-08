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
            author: req.user,
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

const getAllBooks = async (req:AuthenticatedRequest, res: Response, next: NextFunction) => {
    let { page: pageNumber = 1, limit: limitNumber = 5, query, sortBy, sortType } = req.query;
    let page = isNaN(Number(pageNumber)) ? 1 : Number(pageNumber);
    let limit = isNaN(Number(limitNumber)) ? 5: Number(limitNumber);
    if(page < 0) page = 1;
    if(limit <= 0) limit = 5;
    const matchStage: any = {};
    if(query){
        matchStage["$match"] = {
            $or: [
                { title: {$regex: query, $options: "i"} },
                { genre: {$regex: query, $options: "i"} },
                { "author.authorName": {$regex: query, $options: "i"} },
            ]
        };
    }
    else{
        matchStage["$match"] = {};
    }
    
    const sortStage: any = {};
    if(sortBy && sortType){
        sortStage["$sort"] = {
            [sortBy as string]: sortType === 'asc' ? 1 : -1,
        }
    }
    else{
        sortStage["$sort"] = {
            createdAt: -1
        }
    }
    const pipeline = [
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },
        {
            $unwind: "$author"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                genre: 1,
                coverImage: 1,
                file: 1,
                createdAt: 1,
                updatedAt: 1,
                author: {
                    author_id: "$author._id",
                    authorName: "$author.name",
                    // authorEmail: "$author.email"
                }
            }
        },
        matchStage,
        sortStage,
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        // {
        //     $group: {
        //         _id: null,
        //         books: "$$ROOT",
        //     }
        // },
        // {
        //     $project: {
        //         _id: 0,
        //         books: 1
        //     }
        // }
    ]
    
    try {
        // const books = await booksModel.find();
        const books = await booksModel.aggregate(pipeline);
        if(!books){
            return next(createHttpError(500, 'Error while fetching books from DB'))
        }
        res.status(200).json({message: 'Books fetched successfully', books});
    } catch (error) {
        next(createHttpError(500, "Error while fetching books"));
    }
}
export {
    createBook,
    updateBook,
    getAllBooks
}
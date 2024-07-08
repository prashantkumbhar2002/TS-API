import { Router } from "express";
import { createBook, getAllBooks, updateBook } from "./books.controller";
// import multer from 'multer';
// import path from "node:path";
import { upload } from "../middlewares/multer.middlewares";
import { verifyJWT } from "../middlewares/auth.middleware";

const bookRouter = Router();
// const upload = multer({
//     dest: path.resolve(__dirname, '../../public/data/uploads'),
//     limits: { fileSize: 3e7 }
// })

bookRouter
.route('/')
.post(verifyJWT, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), createBook)
.get(getAllBooks)

bookRouter.route("/:bookId").patch(verifyJWT, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), updateBook)

export default bookRouter;
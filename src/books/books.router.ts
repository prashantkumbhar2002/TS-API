import { Router } from "express";
import { createBook } from "./books.controller";
// import multer from 'multer';
// import path from "node:path";
import { upload } from "../middlewares/multer.middlewares";

const bookRouter = Router();
// const upload = multer({
//     dest: path.resolve(__dirname, '../../public/data/uploads'),
//     limits: { fileSize: 3e7 }
// })

bookRouter
.route('/')
.post(upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), createBook)

export default bookRouter;
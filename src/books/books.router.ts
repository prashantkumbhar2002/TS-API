import { Router } from "express";
import { createBook } from "./books.controller";


const bookRouter = Router();

bookRouter.post('/', createBook)

export default bookRouter;
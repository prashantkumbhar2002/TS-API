import { Router } from "express";
import { registerUsers } from "./users.controller";

const userRouter = Router();

userRouter.post('/register', registerUsers)


export default userRouter;
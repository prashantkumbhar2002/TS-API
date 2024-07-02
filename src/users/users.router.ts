import { Router } from "express";
import { loginUsers, registerUsers } from "./users.controller";

const userRouter = Router();

userRouter.post('/register', registerUsers);
userRouter.post('/login', loginUsers);


export default userRouter;
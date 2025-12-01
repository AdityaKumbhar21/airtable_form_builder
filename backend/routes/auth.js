import { Router } from "express";
import { airtableAuth, airtableCallback, checkAuth, logout } from "../controllers/authController.js";
import { isUserLoggedIn } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.get("/airtable", airtableAuth);
authRouter.get("/airtable/callback", airtableCallback);
authRouter.get("/check", isUserLoggedIn, checkAuth);
authRouter.post("/logout", logout);


export default authRouter;

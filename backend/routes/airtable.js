import { Router } from "express";
import { isUserLoggedIn } from "../middlewares/authMiddleware.js";
import { getBases, getTables, getFields } from "../controllers/airtableController.js";
import { airtableRefreshToken } from "../middlewares/airtableMiddleware.js";

const airtableRouter = Router();


airtableRouter.get('/bases', isUserLoggedIn, airtableRefreshToken, getBases);
airtableRouter.get('/tables/:baseId', isUserLoggedIn, airtableRefreshToken, getTables);
airtableRouter.get('/fields/:tableId', isUserLoggedIn, airtableRefreshToken, getFields);


export default airtableRouter;
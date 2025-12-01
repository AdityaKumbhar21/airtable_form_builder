import { Router } from "express";
import { airtableRefreshToken } from "../middlewares/airtableMiddleware.js";
import { isUserLoggedIn } from "../middlewares/authMiddleware.js";
import { createForm, getForm, getUserForms, deleteForm, submitForm } from "../controllers/formController.js";

const formRouter = Router();

formRouter.post("/create", airtableRefreshToken, isUserLoggedIn, createForm);
formRouter.get("/list", airtableRefreshToken, isUserLoggedIn, getUserForms);
formRouter.get("/view/:formId", getForm);
formRouter.delete("/delete/:formId", airtableRefreshToken, isUserLoggedIn, deleteForm);
formRouter.post("/submit/:formId", submitForm);

export default formRouter;
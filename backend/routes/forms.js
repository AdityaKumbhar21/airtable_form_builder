import { Router } from "express";
import { airtableRefreshToken } from "../middlewares/airtableMiddleware.js";
import { isUserLoggedIn } from "../middlewares/authMiddleware.js";
import { createForm, getForm, getUserForms, deleteForm, submitForm } from "../controllers/formController.js";

const formRouter = Router();

formRouter.post("/createForm", airtableRefreshToken, isUserLoggedIn, createForm);
formRouter.get("/forms", airtableRefreshToken, isUserLoggedIn, getUserForms);
formRouter.get("/:formId", getForm);
formRouter.delete("/:formId", airtableRefreshToken, isUserLoggedIn, deleteForm);
formRouter.post("/:formId/submit", submitForm);


export default formRouter;
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dbConnect from './lib/dbConnect.js';
import authRouter  from './routes/auth.js';
import airtableRouter from './routes/airtable.js';
import formRouter from './routes/forms.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter)
app.use("/api", airtableRouter)
app.use("/f", formRouter)



const PORT = process.env.PORT

app.listen(PORT, async () => {

  console.log(`Server is running on port ${PORT}`);
  await dbConnect()
  
});



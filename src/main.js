import express from "express";
import { authController } from "./modules/index.js";
import { globalErrorHandler } from "./middleware/index.js";
import { bootstrapDB } from "./DB/connection.db.js";
import { PORT } from "./config.js";
import { UserController } from "./modules/user/index.js";
import cors from 'cors'

const app = express();

bootstrapDB(app, PORT)
app.use(cors())

app.use(express.json());


app.all("/", (req, res) => {
    return res.status(200).json({ "message": "welcome to my API" });
})

app.use("/auth", authController);
app.use("/user", UserController);


app.all("{/*dummy}", (req, res) => {
    return res.status(404).json({ "message": "APP Route Not Found" });
})

app.use(globalErrorHandler);


import express from "express";
import { authController, messageController } from "./modules/index.js";
import { globalErrorHandler } from "./middleware/index.js";
import { bootstrapDB } from "./DB/connection.db.js";
import { ORIGIN, PORT } from "./config.js";
import { UserController } from "./modules/user/index.js";
import cors from 'cors'
import helmet from "helmet";
import morgan from "morgan";
import { generateLimiter } from "./common/utils/limiter.js";

const app = express();

await bootstrapDB(app, PORT)

var corsOptions = {
    origin: function (origin, callback) {

        if (!ORIGIN.includes(origin)) {
            callback(new Error("Unautharized origin", { cause: { status: 401 } }), ORIGIN)
        } else {
            callback(null, ORIGIN)
        }
    }
}

const limiter = generateLimiter({ limit: 5 })

app.set("trust proxy", true)

app.use(
    // cors(corsOptions),
    morgan('common'),
    helmet(),
    cors(),
    limiter,
    express.json());

app.use('/assets', express.static("./assets"))

app.all("/", (req, res) => {
    return res.status(200).json({ "message": "welcome to my API" });
})

app.use("/auth", authController);
app.use("/user", UserController);
app.use("/message", messageController);

app.all("{/*dummy}", (req, res) => {
    return res.status(404).json({ "message": "APP Route Not Found" });
})

app.use(globalErrorHandler);




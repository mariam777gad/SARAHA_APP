import mongoose from "mongoose";
import { DB_URI, DB_URI_LOCAL } from "../config.js";
import { UserModel } from "./model/user.model.js";


export const bootstrapDB = async (app, port) => {
    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 })
        await UserModel.syncIndexes()
        console.log(`DB Connected Successfully`);

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    } catch (error) {
        console.log(`Faild to connect DB ${error}`);
        process.exit(1)
    }
}
// require ('dotenv').config({path : "./env"})
import dotenv from "dotenv";
import connectDB from "./db/index.js"
import express from "express";
   


const app= express();
dotenv.config({
    path : "./env"
})


connectDB()
.then(() => {
    console.log("Database connected successfully!");
   
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with failure
});













/*import express from "express";
const app = express();

( async ()=> {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error) =>{
            console.log("errror",error);
            throw error
        })

        app.listen(process.env.PORT,() => {
            console.log("App is listening!")
        })

    } catch (error) {
        console.error("error",error)
        throw error
    }
})()
*/
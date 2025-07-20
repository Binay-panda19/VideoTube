// require ('dotenv').config({path : "./env"})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"; // ✅ Use the configured app

// Load environment variables from the .env file
// Ensure this is done before using any environment variables
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    console.log("Database connected successfully!");

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
    app.get("/", (req, res) => {
      res.send("Welcome to the API");
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

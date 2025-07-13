import mongoose , { Schema } from "mpongoose";

const videoSchema = new Schema({});

export const video = mongoose.model("Video" , videoSchemama);
// This code defines a Mongoose schema for a video model, which can be used to interact with a MongoDB database. The schema is currently empty, meaning it does not define any specific fields or validation rules for the video documents. The model is then exported for use in other parts of the application.
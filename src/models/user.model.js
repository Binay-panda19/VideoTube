import mongoose , { Schema } from 'mnongoose';

const userSchema = new Schema({});


export const user = mongoose.model("User", userSchema);
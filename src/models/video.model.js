import mongoose , { Schema } from "mpongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
    videofile:{
        type:String,  //cloudinary Url
        required: true
    },
    thumbnail:{
        type: String, //cloudinary Url
        required: true,
    },
    title:{
        type:String,
        required: true,

    },
    description:{
        type:String,
        required: true
    },
    duration:{
        type: Number, //cloudinary Url
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default: true
    },
    owner:{
        type:Schema.Types.objectId,
        ref:"User"
    }
},
{
    timestamps: true
}
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video" , videoSchema);
// This code defines a Mongoose schema for a video model, which can be used to interact with a MongoDB database. The schema is currently empty, meaning it does not define any specific fields or validation rules for the video documents. The model is then exported for use in other parts of the application.
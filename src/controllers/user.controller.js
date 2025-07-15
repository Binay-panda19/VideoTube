import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js'; 
import { uploadOnCloudinary } from '../utils/cloudinary.js'; 
import { apiResponse } from '../utils/apiResponse.js';


// Function to register a user

const registerUser = asyncHandler(async (req, res) => {
  //get details from the frontend
  //valid the details - not empty
  //check if the user already exists
  //checlk for images and avatar
  //upload the image to cloudinary
  //create the user-object-create user in database
  //remove password and refresh token form the response
  //check for user creation 
  //if created, send the response with user details

  const {fullName, email,username, password} = req.body;
  if(fullName === "" || email === "" || username === "" || password === ""){
    throw new apiError("Please fill all the fields", 400);
  }

  const existedUser = await User.findOne({ $or: [{email}, {username}] })

  if(existedUser){
    throw new apiError(409,"User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  } 

  if(!avatarLocalPath){
    throw new apiError(400,"please upload avatar");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

  if(!avatar){
    throw new apiError(500,"avatar uplaod failed");
  }

  const user = await User.create({
    fullName,
    email,
    username,
    password,
    avatar:  avatar.url,
    coverImage: coverImage?.url || "",
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new apiError(500,"User creation failed");
  }

  return res.status(201).json(
   new apiResponse(
      200, "User created successfully",createdUser
    ));


    
});

export {registerUser};
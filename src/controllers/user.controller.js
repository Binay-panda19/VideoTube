import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js'; 
import { uploadOnCloudinary } from '../utils/cloudinary.js'; 
import { apiResponse } from '../utils/apiResponse.js';
// import { verifyJWT } from '../middlewares/auth.middleware.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) =>{
  try{
    const user = await User.findById(userId);
    const accessToken = user.createJWT();
    const refreshToken = user.createRefreshJWT();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };

  }catch(error){
    throw new apiError(500, "Error generating tokens");
  }
}

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

const loginUser = asyncHandler(async (req, res) => {
  //get details from the frontend
  //valid the details - not empty
  //check if the user already exists
  //password check
  //access and refresh token generation
  //send cookie with refresh token

  // console.log(req.body)
  const {email,username,password} = req.body;
  
  if(!(email || username)) {
    throw new apiError(400,"Please provide email or username ");
  }

  const user = await User.findOne({ $or: [{email}, {username}]})

  if(!user){
    throw new apiError(404,"User not found");
  }

  const isPasswordMatched = await user.isPasswordCorrect(password);

  if(!isPasswordMatched){
    throw new apiError(401,"Password is incorrect");
  }

  const { accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure:true
  }

  return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(new apiResponse(200, {
    user : loggedInUser,accessToken, refreshToken,
  },
  "User logged in successfully "
))



});


const logoutUser = asyncHandler(async (req, res) => {
  //clear the cookies
  //remove the refresh token from the user document

  await User.findByIdAndUpdate(
    req.user._id, 
    {   
      $set : {
        refreshToken: "" }
    },
    { 
      new: true 
    }
  );
  
    const options = {
    httpOnly: true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("refreshToken", options)
  .clearCookie("accessToken", options)
  .json(new apiResponse(200,{}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler (async(req,res) =>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

  if(!incomingRefreshToken){
    throw new apiError(401,"No refresh token recieved");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET = your_refresh_token_secret_key
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if(!user){
      throw new apiError(401,"Invalid Refresh Token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401," Refresh Token is expired or used");
    }
  
    const options = {
      httpOnly : true ,
      secure : true
    }
  
    const {refreshToken , accessToken} = await generateAccessAndRefreshTokens(user._id);
  
    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken ",accessToken,options)
    .json(
      new apiResponse(
        200,
        {accessToken,refreshToken},
        "Access Token Refreshed"
      )
    )
  } catch (error) {
    throw new apiError(401,"Invalid Refresh Token")
  }
  
});


const changeCurrentPassword = asyncHandler(async (req,res) => {
  const {oldPassword , newPassword} = req.body;

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new apiError(400,"Wrong old Password")
  }

  user.password = newPassword;
  await user.save({validateBeforeSave:false})
  
  return res
  .status(200)
  .json(new apiResponse(
    200,{},"Your password is changed succesfully"
  ))
  
  
})


const getCurrentUser = asyncHandler((req,res) => {
  return res
  .status(200)
  .json(new apiResponse(
    200,{},"current user fetched successfully"))
})

const updateAcount = asyncHandler(async(req,res)=>{
  const {fullName , email} = req.body

  if(!fullName || !email){
    throw new apiError(400,"fields are empty ")
  }

  const user  = User.findByIdAndUpdate(
    req.user?._id,{
      $set : {
        fullName,
        email
      }
    },
    {
      new:true
    }
    
  ).select("-password")

  return res.status(200)
  .json(new apiResponse(200,user,"Account details updated successfully"));


})


const updateUserAvatar = asyncHandler(async(req,res)=>{
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
    throw new apiError(400,"no files for changes of Avatar");
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);

   if(!avatar){
    throw new apiError(400,"Error while uploading of avatar")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        avatar:avatar.url
      }
    },
    {
      new:true
    }
   ).select("-password")

   return res.status(200).json(new apiResponse(200,user,"Avatar was updated succesfully"))
});

const updateUserCoverImage = asyncHandler(async(req,res)=>{
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
    throw new apiError(400,"no files for changes of cover image");
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!coverImage){
    throw new apiError(400,"Error while uploading of cover image")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        coverImage:coverImage.url
      }
    },
    {
      new:true
    }
   ).select("-password")

   return res.status(200).json(new apiResponse(200,user,"Cover Image was updated succesfully"))
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAcount,
  changeCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage
};
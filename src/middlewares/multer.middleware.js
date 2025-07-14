import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {  
        cb(null, './public/temp'); // Specify the directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null,filename.originalname); // Use the original file name
    }
});

export const upload = multer({
    storage,
});
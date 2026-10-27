require("dotenv").config();

const PORT = process.env.PORT;

if(!PORT){
    throw new Error("PORT does not found in .env file");
    
}
const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
    throw new Error("MONGO_URI does not found in .env file");
    
}

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET){
    throw new Error("JWT_SECRET does not found in .env file");
}



module.exports={
    PORT,
    MONGO_URI,
    JWT_SECRET,
}

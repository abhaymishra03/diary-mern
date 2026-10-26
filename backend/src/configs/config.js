require("dotenv").config();

const PORT = process.env.PORT;

if(!PORT){
    throw new Error("PORT does not found in .env file");
    
}
const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
    throw new Error("MONGO_URI does not found in .env file");
    
}



module.exports={
    PORT,
    MONGO_URI,
}

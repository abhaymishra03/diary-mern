const mongoose = require("mongoose");
const {MONGO_URI} =require("./config");



const connectDB = async () => {


try {
    await mongoose.connect(MONGO_URI);
    console.log("MONGODB Connected Successfully");
    
}catch(err) {

    console.log(`MONGODB Connection failed ${err}`);
    
} 
}


module.exports={connectDB};



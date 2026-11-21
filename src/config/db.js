const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGO DB CONNECTED SUCCESSFULLY!")
    }
    catch(err){
        console.log("MONGI DB CONNECTION FAILED", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
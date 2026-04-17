import mongoose from 'mongoose';

export const connectDb = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);

        // first await to connect then
        console.log("MONGODB CONNECTED SUCCESSFULLY!");
    }
    catch(error){
        // if there is some error
        console.error("ERROR connecting mongodb: ",error);
        process.exit(1) // process exited with failure

    }
}
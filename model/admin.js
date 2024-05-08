import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/kepapro");

const adminSchema = mongoose.Schema({
    id: String,
    username: String,
    doj: {
        type: Date,
        default: Date.now()
    },
    email:String,
    password: String,
    passkey:String,
});

const admin = mongoose.model("admin", adminSchema);

export default admin;

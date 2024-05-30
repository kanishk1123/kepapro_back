import mongoose from "mongoose";

mongoose.connect("mongodb+srv://apimails1:F8xaA76TOrDA64Rd@cluster0.ljlgl7m.mongodb.net/");

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
    admin::String,
});

const admin = mongoose.model("admin", adminSchema);

export default admin;

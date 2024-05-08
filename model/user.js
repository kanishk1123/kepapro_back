import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/kepapro");

const userSchema = mongoose.Schema({
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

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:function(this: any) { return !this.googleId; },
        enum:["student","teacher"]
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:function(this: any) { return !this.googleId; }
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    avatar:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    }
});
const User = mongoose.model("User",userSchema);
export default User;
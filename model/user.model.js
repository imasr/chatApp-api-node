import bcrypt from "bcrypt";
import { mongoose } from "./../mongoDb/db";

//user schema
var UserSchema=mongoose.Schema({
    username: {
        type: String,
        required:[true,'Name is Required'],
    },
    email: {
        type:String,
        unique:true,
        required:[true,'Email Required']
    },
    password:{
        type:String,
        required:[true,'password Required'],
        minlength:[3, 'password must be atleast 3 charcacter long']
    }
})

//encrypt password before saving to db
UserSchema.pre('save', function(next){
    var user= this;
    bcrypt.hash(user.password, 10, function(err,res){
        if(err){
            return next(err);
        }
        user.password=res;
        next();
    })
})

//resgistering schema to model
var UserModel=mongoose.model('UserModel', UserSchema)


module.exports= {
    UserModel
};
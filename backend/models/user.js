const mongoose  = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "Please enter your name"],
        maxLength:[30, "Name can't exceed 30 characters"]
    },
    email:{
    type: String,
    required:[true, "Please enter an email address"],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password:{
        type: String,
        required:[true, 'Please enter a password'],
        minlength:[6,"Password must be longer than 6 characters"],
        select: false
    },
    avatar:{
        public_id: {
            type: String,
            //required: true    MAKE THIS TRUEE!!!!
        },
        url:{
            type: String,
            //required: true  MAKE THIS TRUEE!!!! 
        }

    },
    role:{
        type: String,
        default:'user'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
    
})

//encrypt password before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJwtToken = function (){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE_TIME
    });
}

userSchema.methods.comparePassword = async function (enteredPass){
    return await bcrypt.compare(enteredPass, this.password);
}

userSchema.methods.getResetPasswordToken = function(){
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //hash the token and set to resetPasswordToken of user
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //set resetPasswordExpire time
    this.resetPasswordExpire = Date.now() + 30 * 60 *1000;

    return resetToken;
}

module.exports  = mongoose.model("User", userSchema);
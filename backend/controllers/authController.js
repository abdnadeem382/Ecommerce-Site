const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.registerUser = catchAsyncErrors(async (req, res, next)=>{
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email, 
        password,
        avatar:{
            public_id :'',
            url:''
        }
    })

    sendToken(user,200, res);

})

exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email, password} = req.body;
    
    //Check if email & password is entered
    if(!email || !password){
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    //Find user in DB   
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorHandler('Invalid Email or Password', 401));  
    }

    //match password
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password', 401));    
    }

    //assign token if user is valid
    sendToken(user,200, res);
})

exports.logout = catchAsyncErrors(async (req,res,next)=>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new ErrorHandler('No user found with this email', 404));  
    }

    //Get reset Token
    const restToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});
    //create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${restToken}`;
    const message = `Your password resest token is:\n\n${resetUrl}\n\n Ignore this if you have not requested it!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Shopit Password Reset',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        })
    } catch (error) {
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message,500));
    }

})

exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    //hash url token
    const resetPasswordToken  = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user  = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or has expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Passwords do not match', 400))
    }

    user.password = req.body.password;
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save()
    sendToken(user,200,res); 
})

exports.getUSerProfile = catchAsyncErrors(async(req,res,next)=>{
    const user  = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})


exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user  = await User.findById(req.user.id).select('+password');
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched){
        return next(new ErrorHandler('Old password is incorrect',400))
    }

    user.password = req.body.password;
    await user.save();
    sendToken(user,200,res);
})

exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
   const newUserData = {
       name: req.body.name,
       email: req.body.email
   }

   const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
       new: true,
       runValidators: true,
       useFindAndModify: false
   });

   res.status(200).json({
       success: true,
       user
   })
})

//ADMIN ROUTES

exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
})


exports.getUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    
    if(!user){
        return next(new ErrorHandler(`User not found with id ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})


exports.updateUser = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

 
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
 
    res.status(200).json({
        success: true,
        user
    })
 })

 exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    
    const user = await User.findById(req.params.id);
    
    if(!user){
        return next(new ErrorHandler(`User not found with id ${req.params.id}`, 400))
    }

    // TODO: Remove avater from cloudinary
    await user.remove();

    res.status(200).json({
        success: true,
        user
    })
 })
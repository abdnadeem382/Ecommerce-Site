const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');


//create order
exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo 
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        sucess: true,
        order
    })
})

//get a specific order
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email')
    if(!order){
        return next(new ErrorHandler('No order found with this id', 404))
    }
    res.status(200).json({
        success: true,
        order
    })

})

//get all orders of the logged in user
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user: req.user.id})
    
    res.status(200).json({
        success: true,
        orders
    })

})
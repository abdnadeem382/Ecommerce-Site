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

//get all orders (Admin route)
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find()
    let totalAmount = 0;
    orders.forEach(order=>{
        totalAmount +=order.totalPrice
    })
    
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })

})


//update or process an order (Admin route)
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id)
    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('We have already delivered the order', 400))
    }

    //for each item in the order, update the stock of the item 
    order.orderItems.forEach(async item =>{
        await updateStock(item.product, item.quantity)
    })

    //change the order status of the order
    order.orderStatus = req.body.status;

    //change the delivered At date to now's date
    order.deliveredAt = Date.now();

    await order.save()
    
    res.status(200).json({
        success: true,
    })

})


//function to update stock of a product
async function updateStock(id, quantity){
    const product = await Product.findById(id)

    product.stock = product.stock - quantity
    await product.save({validateBeforeSave: false})
}

//get a single order
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler('No order found with this id', 404))
    }

    await order.remove(); 
    res.status(200).json({
        success: true,
        order
    })

})
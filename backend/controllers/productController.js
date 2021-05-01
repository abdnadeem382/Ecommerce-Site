const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

exports.newProduct = catchAsyncErrors (async (req, res, next)=>{
    req.body.user= req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
})

exports.getProducts = catchAsyncErrors (async (req,res,next) =>{
    const resultsPerPage = 2;
    const apifeatures =  new APIFeatures(Product.find(),req.query).search().filter().paginate(resultsPerPage);
    const products = await apifeatures.query;
    res.status(200).json({
        success: true,
        count: products.length,
        products
    })
})

exports.getSingleProduct  = catchAsyncErrors( async (req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found',404)); 
    }

    res.status(200).json({
        success: true,
        product
    })
         
})

exports.updateProduct = catchAsyncErrors( async (req,res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found',404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        product
    })
})

exports.deleteProduct = catchAsyncErrors( async (req,res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        next(new ErrorHandler('Product not found',404));
    }

    await product.remove();
    res.status(200).json({
        success: true,
        message:"Product deleted successfully"
    })
})
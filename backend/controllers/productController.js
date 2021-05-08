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


//REVIEW CONTROLLERS

//create new review
exports.createNewReview = catchAsyncErrors (async (req, res, next)=>{
    const {rating, comment, productId} = req.body;

    const review = {
        user:   req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)
    const isReviewed = product.reviews.find(
        r=> r.user.toString() === req.user._id.toString()
    )

    if(isReviewed){
        product.reviews.forEach(review=>{
            if(review.user.toString() === req.user._id.toString()){
                review.comment = comment;
                review.rating = rating;
            }
        })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    //update overall average rating
    product.ratings = product.reviews.reduce((acc,item)=> item.rating + acc, 0)/product.reviews.length

    await product.save({validateBeforeSave: false})
    res.status(200).json({
        success: true
    })
})

//get all reviews of a product
exports.getAllReviews = catchAsyncErrors( async (req,res,next)=>{
   const product = await Product.findById(req.query.id)

   res.status(200).json({
       success: true,
       reviews: product.reviews 
   })
})

exports.deleteReview = catchAsyncErrors( async (req,res,next)=>{
    const product = await Product.findById(req.query.productId)
    
    const reviews = product.reviews.filter(review=> review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;
    const ratings = product.reviews.reduce((acc,item)=> item.rating + acc, 0)/reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    },
    {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        reviews: product.reviews 
    })
 })
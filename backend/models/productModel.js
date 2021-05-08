const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxLength: [100, "Product name can't exceed 100 characters"],

    },
    price:{
        type: Number,
        required: [true, "Product price is required"],
        maxLength: [6, "Product price can't exceed 6 characters"],
        default: 0.0
    },
    description:{
        type: String,
        required: [true, "Product description is required"],
    },
    ratings:{
        type: Number,
        default: 0.0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url:{
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required: [true, "Product category is required"],
        enum:{
            values:[
                'Electronics',
                'Cameras',
                'Laptops',
                'Books',
                'Food',
                'Clothing',
                'Beauty/Health',
                'Sports',
                'Home'
            ],
            messsage:"Please select a valid category for the product"
        }
    },
    seller:{
        type: String,
        required: [true, "Product seller is required"]
    },
    stock:{
        type: Number,
        required: [true, "Product stock is required"],
        maxLength :[5,"Product stock can't exceed 5 characters"],
        default: 0
    },
    numOfReviews:{
        type: Number,
        default: 0
    },
    reviews: [
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Product', productSchema);
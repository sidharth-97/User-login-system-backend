import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    Pname: {
        type: String,
        required:true
    },
    quantity: {
        type: Number,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    discountType: {
        type:String
    },
    thumbnail: {
        type: String,
        required:true
    },
    image: {
        type:Array
    }
})

export const Product=mongoose.model("Product",productSchema)
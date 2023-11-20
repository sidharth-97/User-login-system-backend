import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        required:true
    },
    image: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default:false
    },
    code: {
        type:String
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
     return await bcrypt.compare(enteredPassword,this.password)
 }

export const User=mongoose.model('User',userSchema)
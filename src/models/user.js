import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import validator from 'validator';
import bcrypt from 'bcryptjs';


const ObjectId = mongoose.SchemaTypes.ObjectId;

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        trim : true,
    },
    lastName : {
        type : String,
        trim : true,
    },
    userName : {
        type : String,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        validate : [validator.isEmail, 'Invalid Email']
    },
    age : {
        type : Number,
    },
    gender : {
        type : String,
        enum : ['Male', 'Female', 'other']
    },
    dob : {
        type : Date
    },
    password : {
        type : String
    },
    isActive : {
        type : Boolean,
        default : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
})

// userSchema.pre('save', async function () {
//     this.password = await this.generateHashPassword();
// })

// userSchema.methods.generateHashPassword = async function() {
//     return await CryptoJS.AES.encrypt(this.password, 'project@2021').toString();
// }

// userSchema.methods.validatePassword = async function(password) {
//     const bytes = await CryptoJS.AES.decrypt(this.password, 'project@2021');
//     const originalPass = await bytes.toString(CryptoJS.enc.Utf8);
//     if(originalPass === password){
//         return true
//     }
//     return false
//     //return await bcrypt.compare(this.password, password)
// }

userSchema.plugin(mongoosePaginate);

const User = mongoose.model('user', userSchema);
export default User;
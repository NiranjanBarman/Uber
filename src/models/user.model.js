const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name Required"],
    },

    email: {
        type: String,
        required: [true, "Email Required"],
        unique: [true, "Email Must Unique"]
    },

    password: {
        type: String,
        select: false
    },

    verified: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        default: "user"
    }
},{
    timestamps: true
});

userSchema.pre("save", async function () {

    if (this.isModified("password") && this.password) {
        this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
    }
});

userSchema.statics.createUser = async function ({ name, email, password }) {

    return this.create({
        name: name,
        email: email,
        password: password
    });
}

userSchema.methods.comparePassword = async function (password) {

    return bcrypt.compare(password, this.password);
};


const userModel = mongoose.model("user", userSchema, "users");

module.exports = userModel;
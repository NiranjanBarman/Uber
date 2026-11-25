const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const BCRYPT_ROUNDS = 12;

const captainSchema = new mongoose.Schema({
    
    fullName: {
        firstname: {
            type: String,
            required: [true, "Firstname is required"],
            minlength: [3, "Firstname must be at least 3 characters long"]
        },
        lastname: {
            type: String,
            minlength: [3, "Lastname must be at least 3 characters long"]
        }
    },

    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Email is invalid"]
    },

    password: {
        type: String,
        select: false,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        match: [/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"]
    },

    soketId: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    },

    vehicle: {
        color: {
            type: String,
            required: [true, "Vehicle color is required"],
            minlength: [3, "Vehicle color must be at least 3 characters long"]
        },

        plate: {
            type: String,
            required: [true, "Vehicle plate is required"],
            minlength: [3, "Vehicle plate must be at least 3 characters long"]
        },

        capcity: {
            type: Number,
            required: [true, "Vehicle capacity is required"],
            min: [1, "Vehicle capacity must be at least 1"]
        },

        vihacleType: {
            type: String,
            enum: ["car", "motorcycle", "auto"],
            required: [true, "Vehicle type is required"]
        },

        location: {
            lat: {
                type: Number,
                default: null
            },
            lng: {
                type: Number,
                default: null,
            }  
        }
    },

    role: {
        type: String,
        default: "captain"
    },

    verified: {
        type: Boolean,
        default: false
    }
})

captainSchema.pre("save", async function () {

    if (this.isModified("password") && this.password) {
        const bcrypt = require("bcryptjs");
        this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
    }
});

captainSchema.statics.createCaptain = async function (fullName, email, password, vehicle) {
    return this.create({
        fullName: {
            firstname: fullName.firstname,
            lastname: fullName.lastname
        },
        email: email,
        password: password,
        vehicle: {
            color: vehicle.color,
            plate: vehicle.plate,
            capcity: vehicle.capcity,
            vihacleType: vehicle.vihacleType,
            // location: {
            //     lat: vehicle.location.lat,
            //     lng: vehicle.location.lng
            // }
        }
    });
}

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


const captainModel = mongoose.model("Captain", captainSchema, "captains");

module.exports = captainModel;
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.route");
const captainRouter = require("./routes/captain.routes");
const errorMiddleware = require("./Middleware/error.middleware");

const app = express()


app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/user", userRouter);

app.use("/api/captain", captainRouter);

app.use(errorMiddleware);
module.exports = app
const { validationResult, matchedData } = require("express-validator");

const handleValidation = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    req.cleanData = matchedData(req, { locations: ["body"] });
    next();
};

module.exports = { handleValidation };
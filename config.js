var _config = require("./config.json");
var environment = process.env.NODE_ENV || "development";

module.exports = _config[environment];
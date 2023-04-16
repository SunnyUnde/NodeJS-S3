const { getS3Path } = require("./s3-utils");
const { secretKey } = require("./authenticate-utils");

module.exports = { getS3Path, secretKey };

const filessystem = require('fs');
const path = require('path');

module.exports = function checkDirectory(directoryPath) {
    if (!filessystem.existsSync(directoryPath)) {
        filessystem.mkdirSync(directoryPath);
    }
}

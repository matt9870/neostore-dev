const fs = require('fs');

const deleteFile = path => {
    try {
        fs.unlink(path, (err => {
            if (err) throw err;
        }));
        console.log('successfully deleted the image');
        return true;
    } catch (error) {
        console.log('there was an error while deleting the file:', error.message);
    }
}

module.exports = deleteFile;
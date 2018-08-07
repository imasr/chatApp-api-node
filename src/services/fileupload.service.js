import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        file.timestamp = Date.now()
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const uploadFile = multer({ storage }).single('image')

const upload = (req, res) => {
    return new Promise((resolve, reject) => {
        uploadFile(req, res, (err) => {
            if (err || !req.file) {
                reject(err);
            }
            resolve({
                "image": `${req.file.destination}/${req.file.filename}`
            })
        })
    })
}

module.exports = {
    upload
};
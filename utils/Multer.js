// import uuid, {v4} from 'uuid';
import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        const unique = uuidv4()
        cb(null,unique + path.extname(file.originalname) );

    }
  })
  
  const upload = multer({ storage: storage })
  module.exports = upload;
import multer from 'multer';
import path from 'path';

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'src/temp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 5e7);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const uploadMiddleware = multer({ storage });

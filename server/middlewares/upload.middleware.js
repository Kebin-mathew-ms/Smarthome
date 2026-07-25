const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = path.join(__dirname, '../', process.env.UPLOAD_PATH || 'uploads');

// Create base and subdirectories if they don't exist
const subDirs = [
  'companies', 'categories', 'profiles', 'documents', 'services', 'gallery', 'employees',
  'chat/images', 'chat/videos', 'chat/voices', 'chat/documents', 'chat/work-updates', 'chat/thumbnails'
];
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}
subDirs.forEach(sub => {
  const dir = path.join(baseUploadDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = baseUploadDir;
    if (file.fieldname === 'logo' || file.fieldname === 'cover_image') {
      folder = path.join(baseUploadDir, 'companies');
    } else if (file.fieldname === 'icon') {
      folder = path.join(baseUploadDir, 'categories');
    } else if (file.fieldname === 'profile_photo') {
      folder = path.join(baseUploadDir, 'profiles');
    } else if (file.fieldname === 'document') {
      folder = path.join(baseUploadDir, 'documents');
    } else if (file.fieldname === 'thumbnail' || file.fieldname === 'gallery') {
      folder = path.join(baseUploadDir, 'services');
    } else if (file.fieldname === 'gallery_image') {
      folder = path.join(baseUploadDir, 'gallery');
    } else if (file.fieldname === 'employee_photo') {
      folder = path.join(baseUploadDir, 'employees');
    } else if (file.fieldname === 'chat_image') {
      folder = path.join(baseUploadDir, 'chat/images');
    } else if (file.fieldname === 'chat_video') {
      folder = path.join(baseUploadDir, 'chat/videos');
    } else if (file.fieldname === 'chat_voice') {
      folder = path.join(baseUploadDir, 'chat/voices');
    } else if (file.fieldname === 'chat_document') {
      folder = path.join(baseUploadDir, 'chat/documents');
    } else if (file.fieldname === 'work_update_media') {
      folder = path.join(baseUploadDir, 'chat/work-updates');
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type uploaded. Executable files are strictly prohibited.'), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800; // 50MB default for media

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

module.exports = upload;

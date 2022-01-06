import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { environment } from './environment';

const Router = require('@koa/router');
const multer = require('@koa/multer');
const fs = require('fs');
const fsP = require('fs/promises');
const sharp = require("sharp");

const PROJECT = environment.appName;
const FILE = 'router.ts';

interface IFile {
  filename: string;
  path: string;
  urlPath: string;
  destination: string;
}

interface IUploadImageResult {
  bigImageUrl: string;
  thumbImageUrl: string;
}

export const router = new Router();
const upload = multer({
  dest: 'uploads/'
});

async function moveFile(file: IFile): Promise<IFile> {
  const FUNC = 'moveFile()';
  try {
    let subdirName = `${file.filename.substring(0, 2)}` 
    let dirName = `images/${subdirName}`; 
    let filePath = `${dirName}/${file.filename}`;
    let urlPath = `/${subdirName}/${file.filename}`;

    if (! fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    await fsP.rename(file.path, filePath);

    let movedFile = {...file};
    movedFile.destination = dirName;
    movedFile.path = filePath;
    movedFile.urlPath = urlPath;
    return movedFile;
  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    throw new Error('could not move uploaded file');
  }
  
}

async function resizeImage(file: IFile): Promise<IUploadImageResult> {
  const FUNC = 'resizeFile()';
  try {
    const image = sharp(file.path);
    const meta = await image.metadata();

    let result: IUploadImageResult  = {
      bigImageUrl: '',
      thumbImageUrl: '',
    }

    async function toFile(image, file, suffix): Promise<string> {
      await image.jpeg({ mozjpeg: true }).toFile(`${file.path}${suffix}.jpg`)
      return `${file.urlPath}${suffix}.jpg`
    }

    let suffix = '_big';
    if (meta.height > 1200) {
      let url = await toFile(image.resize({height: 1200}), file, suffix);
      result.bigImageUrl = url;
    } else {
      let url = await toFile(image, file, suffix);
      result.bigImageUrl = url;
    }

    suffix = '_thumb';
    if (meta.height > 280) {
      let url = await toFile(image.resize({height: 280}), file, suffix)
      result.thumbImageUrl = url;
    } else {
      let url = await toFile(image, file, suffix)
      result.thumbImageUrl = url;
    }

    return result;

  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    throw new Error('could not resize image');
  }
}

router.get('/', async (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = 'Hello!';
  return;
});

router.post(
  '/upload',
  upload.single('uploaded_file'),
  async (ctx) => {
    const FUNC = 'router.post(/upload)';
    try {
      let file = await moveFile(ctx.request.file);
      let result = await resizeImage(file);
      ctx.response.body = result;

    } catch(err) {
      console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'internal error'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
      return;
    }
  }
);

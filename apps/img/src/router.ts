import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { environment } from './environment';

const Router = require('@koa/router');
const multer = require('@koa/multer');
const fs = require('fs');
const fsP = require('fs/promises');

const PROJECT = environment.appName;
const FILE = 'router.ts';

export const router = new Router();
const upload = multer({
  dest: 'uploads/'
});

async function moveFile(file: any): Promise<any> {
  const FUNC = 'moveFile()';
  try {
    let dirName = `images/${file.filename.substring(0, 4)}`; 
    let filePath = `${dirName}/${file.filename}`;

    if (! fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    await fsP.rename(file.path, filePath);

    let movedFile = {...file};
    movedFile.destination = dirName;
    movedFile.path = filePath;
    return movedFile;
  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    throw new Error('could not move uploaded file');
  }
  
}

router.post(
  '/upload',
  upload.single('uploaded_file'),
  async (ctx) => {
    const FUNC = 'router.post(/upload)';
    try {
      console.log('ctx.request.file', ctx.request.file);

      let file = await moveFile(ctx.request.file);
      ctx.response.body = file;

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

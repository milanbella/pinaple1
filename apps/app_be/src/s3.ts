import { S3Client } from '@aws-sdk/client-s3';
import { ListBucketsCommand  } from '@aws-sdk/client-s3';
import { CreateBucketCommand  } from '@aws-sdk/client-s3';
import { PutObjectCommand } from "@aws-sdk/client-s3";

const path = require('path');
const fs = require('fs');

const client = new S3Client({ 
  endpoint: 'https://ewr1.vultrobjects.com',
  region: 'us-east-1',
});

async function listBuckets() {
  const command = new ListBucketsCommand({});
  const response = await client.send(command);
  console.dir(response);
}

async function createBucket(name: string) {
  const command = new CreateBucketCommand({Bucket: name});
  const response = await client.send(command);
  console.dir(response);
}

async function putFile(filePath: string) {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: "foofoo",
    Key: path.basename(filePath),
    Body: fileStream,
  };

  const data = await client.send(new PutObjectCommand(uploadParams));
  console.dir(data);

}

async function main() {

 await putFile('./picture.jpeg');
}

main();

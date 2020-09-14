import AWS from 'aws-sdk';
import fs from 'fs';

/**
 * Uploads our export to S3
 * @param {string} Key S3 uploader calls the filename a "Key"
 * @param {string} Bucket Name of S3 Bucket
 */
export function uploadToS3(Key, Bucket) {
  const { ACCESS_KEY, SECRET_ACCESS_KEY } = process.env;

  const Body = fs.readFileSync(Key);
  console.log(Body);

  if (!Body) return console.log('No Body');

  const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket,
    Key,
    Body,
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) throw err;

    console.log(`File uploaded successfully. ${data.Location}`);
  });
}

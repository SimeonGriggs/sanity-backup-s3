import AWS from 'aws-sdk'
import fs from 'fs'

import { sendEmail } from './sendEmail'

/**
 * Uploads our export to S3
 * @param {string} Key S3 uploader calls the filename a "Key"
 * @param {string} Bucket Name of S3 Bucket
 * @param {string} email Address to send notification to
 */
export function uploadToS3(Key, Bucket, email) {
  const { ACCESS_KEY, SECRET_ACCESS_KEY } = process.env

  const Body = fs.readFileSync(Key)

  if (!Body) return console.log('No Body')

  const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  })

  const params = {
    ACL: email ? 'public-read' : 'private',
    Bucket,
    Key,
    Body,
  }

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) throw err

    console.log(`File uploaded successfully. ${data.Location}`)

    if (email) {
      sendEmail(data.Location, email)
    }
  })
}

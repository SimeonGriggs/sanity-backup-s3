import express from 'express'
import dotenv from 'dotenv'
import sanityClient from '@sanity/client'
import exportDataset from '@sanity/export'

import { createFilename } from './helpers/createFilename'
import { uploadToS3 } from './helpers/uploadToS3'

const app = express()
const port = process.env.PORT || 5501

dotenv.config()

/**
 * Will trigger a backup
 */
app.get('/:projectId/:dataset/:Bucket/:email', (req, res) => {
  const { projectId, dataset, Bucket, email } = req.params
  const {
    ACCESS_KEY,
    SECRET_ACCESS_KEY,
    SANITY_TOKEN,
    MAILGUN_API,
    MAILGUN_DOMAIN,
    MAILGUN_HOST,
  } = process.env

  if (!projectId) return res.send(`No projectId`)
  if (!dataset) return res.send(`No dataset`)
  if (!Bucket) return res.send(`No S3 Bucket name`)
  if (!ACCESS_KEY) return res.send(`No S3 ACCESS_KEY config variable`)
  if (!SECRET_ACCESS_KEY)
    return res.send(`No S3 SECRET_ACCESS_KEY config variable`)
  if (!SANITY_TOKEN) return res.send(`No SANITY_TOKEN config variable`)

  if (email) {
    if (!MAILGUN_DOMAIN) return res.send(`No MAILGUN_DOMAIN config variable`)
    if (!MAILGUN_HOST) return res.send(`No MAILGUN_HOST config variable`)
  }

  // Instantiate Sanity Client
  const client = sanityClient({
    projectId,
    dataset,
    token: SANITY_TOKEN,
    useCdn: false,
  })

  const filename = createFilename(projectId, dataset)

  const newExport = exportDataset({
    // Instance of @sanity/client configured to correct project ID and dataset
    client,
    dataset,
    outputPath: filename,
    assets: true,
    raw: false, // Default: `false`
    drafts: true, // Default: `true`
    // types: ['products', 'shops'], // Optional, default: all types
    assetConcurrency: 12,
  })

  console.log(`Beginning export of ${filename}`)

  newExport
    .then((exportRes) => {
      console.log('Finished', exportRes)
      uploadToS3(filename, Bucket, email)
    })
    .catch((err) => console.error(err))

  res.send(
    `<table border='1' cellpadding='10'>
      <tr><td>Dataset:</td><td>${dataset}</td></tr>
      <tr><td>Project ID:</td><td>${projectId}</td></tr>
      <tr><td>S3 Bucket:</td><td>${Bucket}</td></tr>
      <tr><td>S3 ACCESS_KEY:</td><td>${
        ACCESS_KEY ? `Exists` : `Missing`
      }</td></tr>
      <tr><td>S3 SECRET_ACCESS_KEY:</td><td>${
        SECRET_ACCESS_KEY ? `Exists` : `Missing`
      }</td></tr>
      <tr><td>SANITY_TOKEN:</td><td>${
        SANITY_TOKEN ? `Exists` : `Missing`
      }</td></tr>
      <tr><td>Email:</td><td>${email}</td></tr>
      <tr><td>MAILGUN_API:</td><td>${
        MAILGUN_API ? `Exists` : `Missing`
      }</td></tr>
      <tr><td>MAILGUN_DOMAIN:</td><td>${
        MAILGUN_DOMAIN ? `Exists` : `Missing`
      }</td></tr>
      <tr><td>MAILGUN_HOST:</td><td>${
        MAILGUN_HOST ? `Exists` : `Missing`
      }</td></tr>
    </table>`
  )
})

app.listen(port, () => {
  console.log(
    `Define a Sanity projectId and dataset, S3 bucket and an email to notify`
  )
  console.log(`http://localhost:${port}/<projectId>/<dataset>/<bucket>/<email>`)
})

/**
 * Default route
 */
app.get('/', (req, res) => {
  res.send('Need a route!')
})

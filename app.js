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

  if (!projectId) return res.send(`No projectId`)
  if (!dataset) return res.send(`No dataset`)
  if (!Bucket) return res.send(`No S3 Bucket name`)

  const {
    ACCESS_KEY,
    SECRET_ACCESS_KEY,
    MAILGUN_API,
    MAILGUN_DOMAIN,
    MAILGUN_HOST,
  } = process.env

  // Get dynamic key for Sanity API Token
  const sanityTokenKey = `${projectId.toUpperCase()}_TOKEN`
  const SANITY_TOKEN = process.env[sanityTokenKey]

  if (!ACCESS_KEY) return res.send(`No S3 ACCESS_KEY config variable`)
  if (!SECRET_ACCESS_KEY)
    return res.send(`No S3 SECRET_ACCESS_KEY config variable`)
  if (!SANITY_TOKEN) return res.send(`No ${SANITY_TOKEN} config variable`)

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

  const config = [
    {
      title: 'Sanity',
      rows: [
        {
          label: 'Dataset:',
          value: dataset,
          secret: false,
        },
        {
          label: 'Project ID:',
          value: projectId,
          secret: false,
        },
        {
          label: 'Sanity Token Key:',
          value: sanityTokenKey,
          secret: false,
        },
        {
          label: 'SANITY_TOKEN',
          value: SANITY_TOKEN,
          secret: true,
        },
      ],
    },
    {
      title: 'S3',
      rows: [
        {
          label: 'Bucket:',
          value: Bucket,
          secret: false,
        },
        {
          label: 'ACCESS_KEY',
          value: ACCESS_KEY,
          secret: true,
        },
        {
          label: 'SECRET_ACCESS_KEY',
          value: SECRET_ACCESS_KEY,
          secret: true,
        },
      ],
    },
    {
      title: 'Mailgun',
      rows: [
        {
          label: 'Email:',
          value: email,
          secret: false,
        },
        {
          label: 'MAILGUN_API',
          value: MAILGUN_API,
          secret: true,
        },
        {
          label: 'MAILGUN_DOMAIN',
          value: MAILGUN_DOMAIN,
          secret: true,
        },
        {
          label: 'MAILGUN_HOST',
          value: MAILGUN_HOST,
          secret: true,
        },
      ],
    },
  ]

  const markup = config
    .map(
      (item) => `<h2>${item.title}</h2>
      <table border='1' cellpadding='10'>
    ${
      item.rows
        ? item.rows
            .map(
              (row) =>
                `<tr><td>${row.label}</td><td>${
                  row.secret ? (row.value ? `Exists` : `Missing`) : row.value
                }</td></tr>`
            )
            .join('')
        : '<tr><td colspan="2">No config found</td></tr>'
    }
  </table>`
    )
    .join('')

  res.send(markup)
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

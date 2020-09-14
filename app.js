import express from 'express';
import dotenv from 'dotenv';
import sanityClient from '@sanity/client';
import exportDataset from '@sanity/export';

import { createFilename } from './helpers/createFilename';
import { uploadToS3 } from './helpers/uploadToS3';

const app = express();
const port = process.env.PORT || 5501;

dotenv.config();

/**
 * Will trigger a backup
 */
app.get('/:projectId/:dataset/:Bucket', (req, res) => {
  const { projectId, dataset, Bucket } = req.params;
  const { ACCESS_KEY, SECRET_ACCESS_KEY, SANITY_TOKEN } = process.env;

  if (!projectId) return res.send(`No projectId`);
  if (!dataset) return res.send(`No dataset`);
  if (!Bucket) return res.send(`No S3 Bucket name`);
  if (!ACCESS_KEY) return res.send(`No S3 ACCESS_KEY config variable`);
  if (!SECRET_ACCESS_KEY)
    return res.send(`No S3 SECRET_ACCESS_KEY config variable`);
  if (!SANITY_TOKEN) return res.send(`No SANITY_TOKEN config variable`);

  // Instantiate Sanity Client
  const client = sanityClient({
    projectId,
    dataset,
    token: SANITY_TOKEN,
    useCdn: false,
  });

  const filename = createFilename(projectId, dataset);

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
  });

  console.log(`Beginning export of ${filename}`);

  newExport
    .then(exportRes => {
      console.log('Finished', exportRes);
      uploadToS3(filename, Bucket);
    })
    .catch(err => console.error(err));

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
    </table>`
  );
});

app.listen(port, () => {
  console.log(`Define a Sanity projectId and dataset, and S3 bucket`);
  console.log(`http://localhost:${port}/<projectId>/<dataset>/<bucket>`);
});

/**
 * Default route
 */
app.get('/', (req, res) => {
  res.send('Need a route!');
});

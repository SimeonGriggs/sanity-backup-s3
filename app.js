import express from 'express';
import dotenv from 'dotenv';

import { writeJson } from './helpers/index';

const app = express();
const port = process.env.PORT || 5501;

dotenv.config();

/**
 * Will trigger a backup
 */
app.get('/:projectId/:dataset/:Bucket', (req, res) => {
  const { projectId, dataset, Bucket } = req.params;
  const { ACCESS_KEY, SECRET_ACCESS_KEY } = process.env;

  if (!projectId) return res.send(`No projectId`);
  if (!dataset) return res.send(`No dataset`);
  if (!Bucket) return res.send(`No S3 Bucket name`);
  if (!ACCESS_KEY) return res.send(`No S3 ACCESS_KEY config variable`);
  if (!SECRET_ACCESS_KEY)
    return res.send(`No S3 SECRET_ACCESS_KEY config variable`);

  writeJson(projectId, dataset, Bucket);

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

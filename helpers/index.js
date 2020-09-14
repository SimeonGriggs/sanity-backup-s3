import { promises as fs } from 'fs';
import { spawn, exec } from 'child_process';

import { uploadToS3 } from './uploadToS3';
import { cleanUp } from './cleanUp';

function dateFormatted() {
  const d = new Date();
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) console.warn(error);
      if (stderr) reject(stderr);
      if (stdout) resolve(stdout);
    });
  });
}

/**
 * Runs sanity cli export
 * @param {string} projectId Sanity project ID
 * @param {string} dataset Name of Sanity dataset
 * @param {string} Bucket Name of S3 Bucket
 */
export function runExport(projectId, dataset, Bucket) {
  const today = dateFormatted();
  const filename = `${projectId}-${dataset}-${today}.tar.gz`;

  // This runs `sanity dataset export` with args
  const command = `npm run export -- ${dataset} ./${filename}`;
  const runExportCommand = execShellCommand(command).then(res => {
    console.log('export finished?');
    uploadToS3(filename, Bucket);
  });
  console.log(runExportCommand);
}

/**
 * Writes a sanity.json file, read by the Sanity CLI
 * @param {string} projectId Sanity project ID
 * @param {string} dataset Sanity dataset
 * @param {string} Bucket S3 Bucket name
 */
export async function writeJson(projectId, dataset, Bucket) {
  const cleanUpRun = await cleanUp();

  const sanityJson = JSON.stringify({
    root: true,
    project: {
      name: projectId,
    },
    api: {
      projectId,
      dataset,
    },
  });

  if (cleanUpRun) {
    return new Promise((resolve, reject) => {
      console.log(`Writing sanity.json`);
      fs.writeFile(`./sanity.json`, sanityJson, 'utf8')
        .then(res => {
          console.log(`Wrote sanity.json`, res);
          // resolve(wrote);
          runExport(projectId, dataset, Bucket);
        })
        .catch(err => console.error(err));
    });
  }
}

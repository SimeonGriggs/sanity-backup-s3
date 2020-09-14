import { spawn } from 'child_process';

function runRm(filename) {
  return new Promise((resolve, reject) => {
    const child = spawn(`rm`, [`-f`, filename]);
    child.on('exit', () => resolve(`removed ${filename}`));
  });
}

/**
 * Delete files from a previous export
 */
export async function cleanUp() {
  console.log('Cleaning up old backups and sanity.json file...');
  const oldBackup = runRm(`*.tar.gz`);
  const sanityJson = runRm(`sanity.json`);

  return Promise.all([oldBackup, sanityJson]).then(values => {
    console.log('...clean!');
    return values;
  });
}

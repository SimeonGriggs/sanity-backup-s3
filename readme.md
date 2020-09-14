# Sanity Backup to S3

Satisfy your inner risk manager by taking automated backups from Sanity's CLI tool directly to your S3 bucket!

1. Clone this repo
2. `npm install`
3. Add these required config vars from an appropriately configured AWS IAM user to an `.env` file

```
ACCESS_KEY
SECRET_ACCESS_KEY
```

4. Visit `http://localhost:5501/SANITY_PROJECT_ID/DATASET/BUCKET_NAME`

### This tool will:

1. Create a `sanity.json` file which it needs to...
2. Run the Sanity CLI export command and...
3. Upload that file to S3 and then...
4. Clean up after itself, deleting those files

### It's up to you to:

- Host this somewhere adequelty if you want to run it in an automated fashion _from the cloud_.
- Be entirely cool with how average the code is.
- Question many of my decisions.

Buyer beware. YMMV. Enjoy!

# Sanity Backup to S3

Satisfy your inner risk manager by taking automated backups from Sanity's CLI tool directly to your S3 bucket!

1. Clone this repo
2. `npm install`
3. Add these required config vars from an appropriately configured AWS IAM user to an `.env` file

```
ACCESS_KEY
SECRET_ACCESS_KEY
```

4. Add another config var from a `read` token for your Sanity project:

```
SANITY_TOKEN
```

5. Visit `http://localhost:5501/SANITY_PROJECT_ID/DATASET/BUCKET_NAME`

### This tool will:

1. Run a Sanity Export function based on the params you pass in
2. Upload that file to S3

### It's up to you to:

- Host this somewhere adequately if you want to run it in an automated fashion _from the cloud_. I've tested it working on a ~80mb backup on Heroku. Seems fine.
- Be entirely cool with how average the code is.

Buyer beware. YMMV. Enjoy!

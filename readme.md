# Sanity Backup to S3

I wrote a [better guide to this App on my website](https://www.simeongriggs.dev/backup-sanity-io-to-aws-s3), maybe read it instead? It's more colourful.

---

Satisfy your inner risk manager by taking automated backups from Sanity directly to your S3 bucket!

1. Clone this repo
2. `npm install`
3. Add these required config vars from an appropriately configured AWS IAM user to an `.env` file

```
ACCESS_KEY
SECRET_ACCESS_KEY
```

4. Add another config var from a `read` token for your Sanity project.

This one is a bit tricker. You'll need a Token for each project you plan to backup. So if your Sanity Project ID is `asdf123`, you'd need an Environment Variable called `ASDF123_TOKEN`.

```
<SANITY_PROJECT_ID_IN_ALL_CAPS>_TOKEN
```

5. Optionally, if you want an email notification with a download link, I've integrated Mailgun, which will need these keys in `.env`.

You'll need to have Mailgun setup to take advantage of this.

```
MAILGUN_API
MAILGUN_DOMAIN
MAILGUN_HOST
```

6. Visit `http://localhost:5501/SANITY_PROJECT_ID/DATASET/BUCKET_NAME/EMAIL`

For example:

```
http://localhost:5501/asdf/production/backup-bucket/terrence@example.com
```

### This tool will:

1. Run a Sanity Export function based on the params you pass in
2. Upload that file to S3
3. If an email is supplied, send a notification to that address with a link to download

### It's up to you to:

- Host this somewhere adequately if you want to run it in an automated fashion _from the cloud_. I've tested it working on a ~80mb backup on Heroku. Seems fine.
- Be entirely cool with how average the code is.

Buyer beware. YMMV. Enjoy!

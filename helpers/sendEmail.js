import mailgunFactory from 'mailgun-js'

export function sendEmail(downloadLink, downloadEmail) {
  const { MAILGUN_API, MAILGUN_DOMAIN, MAILGUN_HOST } = process.env

  const mg = mailgunFactory({
    apiKey: MAILGUN_API,
    domain: MAILGUN_DOMAIN,
    host: MAILGUN_HOST,
  })

  const data = {
    from: `Sanity Backup <noreply@${MAILGUN_DOMAIN}>`,
    to: downloadEmail,
    subject: 'Sanity Site Backup Complete',
    text: `Download your backup: ${downloadLink}`,
  }

  return mg.messages().send(data, function (error, body) {
    if (error) {
      console.error({ error })
    } else {
      console.log({ body })
    }
  })
}

function dateFormatted() {
  const d = new Date()
  let month = `${d.getMonth() + 1}`
  let day = `${d.getDate()}`
  const year = d.getFullYear()

  if (month.length < 2) month = `0${month}`
  if (day.length < 2) day = `0${day}`

  return [year, month, day].join('-')
}

/**
 * Runs sanity cli export
 * @param {string} projectId Sanity project ID
 * @param {string} dataset Name of Sanity dataset
 */
export function createFilename(projectId, dataset) {
  const today = dateFormatted()
  return `${projectId}-${dataset}-${today}.tar.gz`
}

import COS from 'cos-nodejs-sdk-v5'

const globalForCos = globalThis as unknown as {
  cos: COS | undefined
}

export const cos = globalForCos.cos ?? new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
})

if (process.env.NODE_ENV !== 'production') globalForCos.cos = cos

/**
 * Upload a buffer to COS
 * @param buffer - The file buffer to upload
 * @param filename - The filename to use (e.g., "abc123.jpg")
 * @param mimeType - The MIME type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadToCOS(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const bucket = process.env.COS_BUCKET!
  const region = process.env.COS_REGION!
  const baseUrl = process.env.COS_BASE_URL!

  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
    }, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(`${baseUrl}/${filename}`)
    })
  })
}

/**
 * Upload a thumbnail buffer to COS
 * @param buffer - The thumbnail buffer to upload
 * @param filename - The original filename (e.g., "abc123.jpg")
 * @returns The URL of the uploaded thumbnail
 */
export async function uploadThumbnail(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const thumbnailFilename = `thumb-${filename}`
  return uploadToCOS(buffer, thumbnailFilename, 'image/jpeg')
}

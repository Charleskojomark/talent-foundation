import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

// The user provided R2_TOKEN, check if we should map it
const finalSecretKey = secretAccessKey === 'your_r2_secret_access_key' && process.env.R2_TOKEN
    ? process.env.R2_TOKEN
    : secretAccessKey;

export const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: finalSecretKey,
    },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'talent-foundation';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Uploads a file to Cloudflare R2
 */
export async function uploadToR2(
    file: Buffer | Uint8Array | string,
    fileName: string,
    contentType: string
) {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: file,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL if set, otherwise return null (for private files)
    return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${fileName}` : fileName;
}

/**
 * Deletes a file from Cloudflare R2
 */
export async function deleteFromR2(fileName: string) {
    // if url is passed in, extract the key
    let key = fileName;
    if (fileName.startsWith('http')) {
        const parts = fileName.split('/');
        key = parts[parts.length - 1];
    }

    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });

    await s3Client.send(command);
    return true;
}

/**
 * Generates a presigned URL to temporarily read a private file
 */
export async function getPresignedUrl(fileName: string, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
    });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

const finalSecretKey = secretAccessKey === 'your_r2_secret_access_key' && process.env.R2_TOKEN
    ? process.env.R2_TOKEN
    : secretAccessKey;

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: finalSecretKey,
    },
});

export async function POST(req: Request) {
    try {
        const { filename, contentType, bucketName = process.env.R2_BUCKET_NAME || 'talent-foundation' } = await req.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: "Filename and content type are required" }, { status: 400 });
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: filename,
            ContentType: contentType,
        });

        // The URL expires in 1 hour
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        let publicUrl = null;
        if (process.env.R2_PUBLIC_URL) {
            publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
        }

        return NextResponse.json({ signedUrl, filename, publicUrl });
    } catch (err: any) {
        console.error("Failed to generate signed URL:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

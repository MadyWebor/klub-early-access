import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.S3_REGION || "eu-north-1",
  // endpoint: undefined  ← let AWS SDK pick the right endpoint
  // forcePathStyle: false ← default; required for AWS S3
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

export function buildPublicUrl(key: string) {
  const base =
    process.env.S3_PUBLIC_BASE_URL ||
    `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
  return `${base.replace(/\/+$/, "")}/${key}`;
}
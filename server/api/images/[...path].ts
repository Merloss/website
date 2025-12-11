import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const config = useRuntimeConfig();

// R2 Configuration from environment variables
// These are server-side only and NOT exposed to the client
// Credentials are secure and never sent to the browser
const R2_ACCOUNT_ID = config.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = config.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = config.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = config.R2_BUCKET_NAME;

// Initialize S3 client for R2
const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY,
	},
});

export default defineEventHandler(async (event) => {
	const path = getRouterParam(event, 'path');
	
	if (!path) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Image path is required',
		});
	}

	// Automatically add images/ prefix if not present
	// This allows using /api/images/filename.png instead of /api/images/images/filename.png
	const r2Key = path.startsWith('images/') ? path : `images/${path}`;

	try {
		// Get object from R2
		const command = new GetObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: r2Key,
		});

		const response = await s3Client.send(command);

		if (!response.Body) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Image not found',
			});
		}

		// Convert stream to buffer
		const stream = response.Body as Readable;
		const chunks: Buffer[] = [];
		
		for await (const chunk of stream) {
			chunks.push(Buffer.from(chunk));
		}
		
		const buffer = Buffer.concat(chunks);

		// Set appropriate headers
		const contentType = response.ContentType || getContentType(r2Key);
		const cacheControl = response.CacheControl || 'public, max-age=31536000, immutable';

		setHeader(event, 'Content-Type', contentType);
		setHeader(event, 'Cache-Control', cacheControl);
		setHeader(event, 'Content-Length', buffer.length);

		// Set ETag if available
		if (response.ETag) {
			setHeader(event, 'ETag', response.ETag);
		}

		// Set Last-Modified if available
		if (response.LastModified) {
			setHeader(event, 'Last-Modified', response.LastModified.toUTCString());
		}

		return buffer;
	} catch (error: any) {
		if (error.$metadata?.httpStatusCode === 404 || error.name === 'NoSuchKey') {
			throw createError({
				statusCode: 404,
				statusMessage: 'Image not found',
			});
		}

		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch image',
		});
	}
});

// Helper function to determine content type from file extension
function getContentType(path: string): string {
	const ext = path.split('.').pop()?.toLowerCase();
	
	const contentTypes: Record<string, string> = {
		'png': 'image/png',
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'webp': 'image/webp',
		'gif': 'image/gif',
		'svg': 'image/svg+xml',
		'avif': 'image/avif',
	};

	return contentTypes[ext || ''] || 'application/octet-stream';
}


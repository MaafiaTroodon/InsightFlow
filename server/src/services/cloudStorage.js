import { v2 as cloudinary } from 'cloudinary';

let _initialized = false;

function init() {
  if (_initialized) return;
  _initialized = true;
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure:     true,
    });
  }
}

export const isCloudConfigured = () => {
  init();
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Upload a buffer to Cloudinary. Returns { url, publicId } or null if not configured.
 */
export const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    init();
    if (!isCloudConfigured()) return resolve(null);

    const opts = {
      folder:          'insightflow/joblogs',
      resource_type:   'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    stream.end(buffer);
  });

/**
 * Delete a Cloudinary asset by publicId.
 */
export const deleteAsset = (publicId) => {
  init();
  if (!isCloudConfigured() || !publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Cloudinary Configuration & Upload Utility
 *
 * Replace the placeholder values below with your Cloudinary credentials.
 * - CLOUD_NAME: Found on Cloudinary Dashboard
 * - UPLOAD_PRESET: Create an unsigned upload preset in Settings → Upload → Upload Presets
 */

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET";

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload an image to Cloudinary using an unsigned upload preset.
 * Works with both local file URIs (from expo-image-picker) and remote URLs.
 *
 * @param uri - The local file URI or remote URL of the image
 * @param folder - Optional folder path in Cloudinary (e.g. "aurora/profiles")
 * @returns The upload result with secure_url, or throws on failure
 */
export async function uploadToCloudinary(
  uri: string,
  folder: string = "aurora"
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();

  // For local file URIs (e.g. from expo-image-picker)
  const filename = uri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Cloudinary upload failed: ${response.status} ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

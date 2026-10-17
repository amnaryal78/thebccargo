import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ImageOptimizationResult {
  url: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
  width: number;
  height: number;
  format: string;
}

export async function compressAndProcessImage(
  file: File,
  maxWidth: number = 900,
  maxHeight: number = 600,
  quality: number = 0.65
): Promise<ImageOptimizationResult> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please upload an image file (JPEG, PNG, WebP, GIF).'));
      return;
    }

    // Validate max file size (15MB input limit)
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('File size exceeds maximum limit of 15MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          // Resize proportionally if dimensions exceed max limits
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to create canvas context for image compression.'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP export, fallback to JPEG
          let dataUrl = canvas.toDataURL('image/webp', quality);
          let format = 'webp';

          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            format = 'jpeg';
          }

          const originalSizeKb = Math.round(file.size / 1024);
          const base64Length = dataUrl.split(',')[1]?.length || 0;
          const compressedSizeKb = Math.round((base64Length * 3) / 4 / 1024);
          const reductionPercentage = originalSizeKb > 0 
            ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
            : 0;

          let finalPublicUrl = dataUrl;

          // If Supabase Storage is available, upload file to Supabase bucket
          if (isSupabaseConfigured) {
            try {
              const response = await fetch(dataUrl);
              const blob = await response.blob();
              const fileName = `cover-${Date.now()}-${Math.random().toString(36).slice(2)}.${format}`;
              const filePath = `covers/${fileName}`;

              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, blob, {
                  contentType: `image/${format}`,
                  cacheControl: '3600',
                  upsert: true
                });

              if (!uploadError && uploadData) {
                const { data: publicData } = supabase.storage
                  .from('blog-images')
                  .getPublicUrl(filePath);

                if (publicData?.publicUrl) {
                  finalPublicUrl = publicData.publicUrl;
                }
              }
            } catch (storageErr) {
              console.warn('Supabase storage upload fallback:', storageErr);
            }
          }

          resolve({
            url: finalPublicUrl,
            originalSizeKb,
            compressedSizeKb,
            reductionPercentage,
            width,
            height,
            format
          });
        } catch (procErr: any) {
          reject(new Error(`Image processing failed: ${procErr.message}`));
        }
      };

      img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file from disk.'));
    reader.readAsDataURL(file);
  });
}

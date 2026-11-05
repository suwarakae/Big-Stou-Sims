/**
 * Client-side image compression and resizing utility
 * Prevents payload too large (413) and gateway timeouts on mobile/iPad camera photos
 */
export async function optimizeImageForOcr(
  source: File | string,
  maxDimension = 1600,
  quality = 0.82
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const handleDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawBase64 = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
          resolve({ dataUrl, base64: rawBase64, mimeType: 'image/jpeg' });
          return;
        }

        // Draw image resized
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export high-quality, lightweight JPEG
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const rawBase64 = optimizedDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        resolve({
          dataUrl: optimizedDataUrl,
          base64: rawBase64,
          mimeType: 'image/jpeg',
        });
      };

      img.onerror = () => {
        const rawBase64 = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        resolve({ dataUrl, base64: rawBase64, mimeType: 'image/jpeg' });
      };

      img.src = dataUrl;
    };

    if (typeof source === 'string') {
      handleDataUrl(source);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleDataUrl(reader.result);
        } else {
          resolve({ dataUrl: '', base64: '', mimeType: 'image/jpeg' });
        }
      };
      reader.onerror = () => {
        resolve({ dataUrl: '', base64: '', mimeType: 'image/jpeg' });
      };
      reader.readAsDataURL(source);
    }
  });
}

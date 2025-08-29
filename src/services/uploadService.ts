import { http } from '../api/http';

export interface UploadResponse {
  success: boolean;
  url: string;
  path: string;
}

export interface MultipleImagesResponse {
  success: boolean;
  images: Array<{
    url: string;
    path: string;
  }>;
}

export interface VideoUploadResponse extends UploadResponse {
  size: number;
  mimetype: string;
}

class UploadService {
  // 上传单张图片
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await http('/upload/image', {
      method: 'POST',
      body: formData,
    });

    return response;
  }

  // 上传多张图片
  async uploadImages(files: File[]): Promise<MultipleImagesResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await http('/upload/images', {
      method: 'POST',
      body: formData,
    });

    return response;
  }

  // 上传视频
  async uploadVideo(file: File): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await http('/upload/video', {
      method: 'POST',
      body: formData,
    });

    return response;
  }

  // 验证文件类型和大小
  validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: '不支持的图片格式，请选择 JPEG、PNG、WebP、GIF 或 BMP 格式' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: '图片大小不能超过 10MB' };
    }

    return { valid: true };
  }

  validateVideo(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: '不支持的视频格式，请选择 MP4、WebM、OGG、MOV 或 AVI 格式' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: '视频大小不能超过 100MB' };
    }

    return { valid: true };
  }

  // 创建文件选择器
  createFileInput(accept: string, multiple: boolean = false): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;

      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files) {
          const files = Array.from(target.files);
          resolve(files);
        } else {
          reject(new Error('没有选择文件'));
        }
      };

      input.oncancel = () => {
        reject(new Error('用户取消了文件选择'));
      };

      input.click();
    });
  }
}

export const uploadService = new UploadService();

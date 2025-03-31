interface UploadResponse {
  url: string;
  filename: string;
  fileType: string;
}

export class FileUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  static validateFile(file: File): string | null {
    if (file.size > this.MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  }

  static async uploadFile(file: File): Promise<UploadResponse> {
    const error = this.validateFile(file);
    if (error) {
      throw new Error(error);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        url: data.url,
        filename: file.name,
        fileType: file.type,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return 'image';
    } else if (fileType === 'application/pdf') {
      return 'pdf';
    } else if (fileType.includes('word')) {
      return 'word';
    } else if (fileType.includes('excel')) {
      return 'excel';
    } else if (fileType === 'text/plain') {
      return 'text';
    }
    return 'file';
  }
} 
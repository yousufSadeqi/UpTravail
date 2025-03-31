import { File, Image, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { FileUploadService } from '../../services/fileUpload';

interface FileAttachmentProps {
  url: string;
  filename: string;
  fileType: string;
  onDownload?: () => void;
}

export default function FileAttachment({ url, filename, fileType, onDownload }: FileAttachmentProps) {
  const getFileIcon = () => {
    const iconType = FileUploadService.getFileIcon(fileType);
    switch (iconType) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'word':
        return <FileText className="w-6 h-6" />;
      case 'excel':
        return <FileSpreadsheet className="w-6 h-6" />;
      case 'text':
        return <FileCode className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDownload) {
      onDownload();
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <a
      href={url}
      onClick={handleClick}
      className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      {getFileIcon()}
      <span className="text-sm truncate max-w-[200px]">{filename}</span>
    </a>
  );
} 
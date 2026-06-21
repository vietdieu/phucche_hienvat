import { useState, useCallback, ChangeEvent } from 'react';

interface UseImageUploadResult {
  file: File | null;
  preview: string | null;       // URL tạm để preview
  base64: string | null;        // Dữ liệu base64 để gửi lên API
  error: string | null;
  isLoading: boolean;
  handleFile: (file: File) => void;
  handleDrop: (acceptedFiles: File[]) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadResult {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const processFile = useCallback((file: File) => {
    // Kiểm tra định dạng
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ các định dạng JPG, PNG, TIFF, WEBP');
      return false;
    }

    // Kiểm tra kích thước (tối đa 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 20MB');
      return false;
    }

    setError(null);
    setFile(file);

    // Tạo URL preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Chuyển sang base64
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64(result); // result là data URI base64
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Không thể đọc file ảnh');
      setIsLoading(false);
    };
    setIsLoading(true);
    reader.readAsDataURL(file);

    return true;
  }, []);

  const handleFile = useCallback((file: File) => {
    processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // Reset input để cho phép chọn lại cùng file
    e.target.value = '';
  }, [processFile]);

  const reset = useCallback(() => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setBase64(null);
    setError(null);
    setIsLoading(false);
  }, [preview]);

  return {
    file,
    preview,
    base64,
    error,
    isLoading,
    handleFile,
    handleDrop,
    handleChange,
    reset,
  };
}

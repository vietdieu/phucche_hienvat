export interface RestoreOptions {
  model?: string;          // Tên model (mặc định 'flux-kontext-apps/restore-image')
  outputFormat?: 'png' | 'jpg';
  prompt?: string;         // Prompt bổ sung nếu model hỗ trợ
}

export interface RestoreResult {
  success: boolean;
  restoredImage: string;   // URL của ảnh đã restore
  error?: string;
  details?: string;
}

export async function restoreImage(
  imageBase64: string,
  options: RestoreOptions = {}
): Promise<RestoreResult> {
  const { model, outputFormat = 'png', prompt } = options;

  try {
    const response = await fetch('/api/ai/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        prompt,
        output_format: outputFormat,
        ...(model && { model }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        restoredImage: '',
        error: errorData.error || 'Lỗi từ máy chủ',
        details: errorData.details,
      };
    }

    const data = await response.json();
    return {
      success: true,
      restoredImage: data.restoredImage,
    };
  } catch (error) {
    return {
      success: false,
      restoredImage: '',
      error: 'Không thể kết nối đến máy chủ',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

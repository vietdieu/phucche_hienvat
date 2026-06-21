export interface ArtifactInfo {
  name: string;
  culture: string;
  era: string;
  location: string;
  description: string;
  significance: string;
  category: string;
  tags: string[];
}

export interface RecognitionResult {
  success: boolean;
  artifact: ArtifactInfo | null;
  error?: string;
}

export async function recognizeArtifact(
  imageBase64: string,
  additionalContext?: string
): Promise<RecognitionResult> {
  try {
    const response = await fetch('/api/ai/recognize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        additionalContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        artifact: null,
        error: errorData.error || 'Lỗi từ máy chủ',
      };
    }

    const data = await response.json();
    return {
      success: true,
      artifact: data.artifact,
    };
  } catch (error) {
    return {
      success: false,
      artifact: null,
      error: 'Không thể kết nối đến máy chủ nhận diện',
    };
  }
}

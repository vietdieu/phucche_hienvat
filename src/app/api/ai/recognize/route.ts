// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema cho kết quả nhận diện
const ArtifactSchema = z.object({
  name: z.string().describe('Tên của hiện vật hoặc di sản'),
  culture: z.string().describe('Nền văn hóa hoặc nền văn minh liên quan'),
  era: z.string().describe('Niên đại hoặc thời kỳ'),
  location: z.string().describe('Địa điểm khai quật hoặc nơi hiện đang lưu trữ'),
  description: z.string().describe('Mô tả ngắn gọn về hiện vật'),
  significance: z.string().describe('Ý nghĩa lịch sử hoặc văn hóa'),
  category: z.string().describe('Danh mục (ví dụ: Tượng, Đồ gốm, Trang sức, Vũ khí, Công cụ)'),
  tags: z.array(z.string()).describe('Từ khóa liên quan'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, additionalContext } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu ảnh. Vui lòng gửi trường "imageBase64".' },
        { status: 400 }
      );
    }

    // Khởi tạo model Gemini
    const model = google('gemini-2.0-flash-exp');

    // Xây dựng prompt
    const prompt = `
      Bạn là một chuyên gia về khảo cổ học và lịch sử nghệ thuật. Hãy phân tích bức ảnh sau và nhận diện hiện vật hoặc di sản văn hóa.

      ${additionalContext ? `Bối cảnh bổ sung: ${additionalContext}` : ''}

      Hãy cung cấp thông tin chi tiết về hiện vật theo các trường sau:
      - Tên
      - Nền văn hóa / văn minh
      - Niên đại / thời kỳ
      - Địa điểm
      - Mô tả
      - Ý nghĩa
      - Danh mục (Tượng, Đồ gốm, Trang sức, Vũ khí, Công cụ, Kiến trúc, Tác phẩm nghệ thuật, Khác)
      - Từ khóa

      Nếu ảnh không rõ ràng hoặc không phải hiện vật, hãy trả về thông tin với name là "Không xác định" và giải thích trong description.
    `;

    // Gọi Gemini với ảnh base64
    const { object } = await generateObject({
      model,
      schema: ArtifactSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image', 
              image: imageBase64, // Hỗ trợ data URI base64
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      artifact: object,
    });

  } catch (error) {
    console.error('Lỗi khi gọi Gemini:', error);
    return NextResponse.json(
      {
        error: 'Không thể nhận diện hiện vật. Vui lòng thử lại.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

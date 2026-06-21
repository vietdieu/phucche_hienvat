// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Khởi tạo client Replicate với API token từ biến môi trường
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Lấy dữ liệu ảnh từ request
    const body = await request.json();
    const { image, prompt, output_format = 'png' } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu ảnh. Vui lòng gửi trường "image".' },
        { status: 400 }
      );
    }

    // 2. Xác định model sẽ sử dụng
    // Sử dụng flux-kontext-apps/restore-image - model đa năng cho phục hồi ảnh
    const model = 'flux-kontext-apps/restore-image';

    // 3. Chuẩn bị input cho model
    // Replicate hỗ trợ nhiều cách truyền file: URL, local file, hoặc base64
    // Chúng ta sẽ truyền trực tiếp chuỗi base64 (data URI)
    const input = {
      input_image: image, // Có thể là URL hoặc data URI base64
      output_format: output_format, // 'png' hoặc 'jpg'
      safety_tolerance: 2, // Mức độ an toàn tối đa
      ...(prompt && { prompt }), // Nếu có prompt thì thêm vào
    };

    // 4. Gọi Replicate API để chạy model
    // Lưu ý: Lần đầu chạy model sẽ mất thời gian boot, các lần sau sẽ nhanh hơn
    const output = await replicate.run(model as any, { input });

    // 5. Xử lý kết quả trả về
    // Output có thể là URL của ảnh đã xử lý
    let restoredImageUrl: string;

    if (typeof output === 'string') {
      restoredImageUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      // Một số model trả về object có method url()
      restoredImageUrl = typeof (output as any).url === 'function' 
        ? (output as any).url() 
        : String((output as any).url);
    } else {
      // Fallback: thử stringify
      restoredImageUrl = String(output);
    }

    return NextResponse.json({
      success: true,
      restoredImage: restoredImageUrl,
    });

  } catch (error) {
    console.error('Lỗi khi gọi Replicate API:', error);
    
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại sau.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

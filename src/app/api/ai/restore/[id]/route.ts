// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prediction = await replicate.predictions.get(params.id);
    
    return NextResponse.json({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Không thể lấy trạng thái dự đoán' },
      { status: 500 }
    );
  }
}

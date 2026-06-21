export interface RestorationConfig {
  decade: string; // "1890s" | "1920s" | "1950s" | "1970s", etc.
  repairTorn: boolean;
  repairScratches: boolean;
  repairWaterSpots: boolean;
  repairCreases: boolean;
  repairMold: boolean;
  faceRestoreIntensity: number; // 0 to 100
  eyeClarity: boolean;
  hairStrands: boolean;
  colorizationMode: "bw" | "mild" | "vivid";
  customInstructions: string;
}

export interface VideoConfig {
  style: "anime_2d" | "pixar_3d";
  action: "blink_and_smile" | "wave_hand" | "talking";
  environment: "windy" | "cinematic_lighting";
  camera: "zoom_in" | "pan_left_right" | "static";
}

export interface PhotoPreset {
  id: string;
  title: string;
  year: string;
  description: string;
  vintageUrl: string;
  restoredUrl: string;
  defaultConfig: RestorationConfig;
  defaultVideoConfig: VideoConfig;
}

export interface ProgressStep {
  status: "idle" | "processing" | "completed" | "failed";
  message: string;
  progress: number; // 0 to 100
}

export const AUTOMATION_JSON = {
  "image_restoration": {
    "positive_base": "High-resolution restoration, de-aging, and modernization of an old, severely damaged photograph.",
    "repair_keywords": "Fix deep scratches, cracks, creases, dust spots, water stains, mold textures, and torn edges.",
    "face_enhance": "Apply advanced blind face restoration, enhance facial features, eye clarity, hair strands, and skin texture realistically.",
    "colorization": {
      "auto_color": "Colorize the black and white image with natural, realistic, and historically accurate skin tones and clothing colors.",
      "keep_original": "Maintain original color tone, balance contrast, remove fading and yellowing effect."
    },
    "quality_tags": "Photorealistic, clean, ultra-sharp focus, 8k UHD, masterpiece, look like it was shot today.",
    "negative": "grainy, blurry, distorted, deformed eyes, oversaturated, fake colors, drawing, painting, low quality, artifacts, digital noise, plastic skin."
  },
  "image_to_video": {
    "styles": {
      "anime_2d": "high-end 2D modern anime style, inspired by Studio Ghibli and Makoto Shinkai aesthetics. 2D animation, vibrant yet nostalgic color palette.",
      "pixar_3d": "premium 3D Pixar and Disney animation style. Stylized highly expressive big curious eyes, smooth clay-like skin shader, rich textures."
    },
    "character_actions": {
      "blink_and_smile": "The character gently blinks their eyes, smiles warmly, and maintains realistic breathing animation.",
      "wave_hand": "The character looks around in wonder, smiles happily, and waves their hand friendly towards the camera.",
      "talking": "The character speaks naturally with realistic lip synchronization, expressive facial movements, and head tilting."
    },
    "environment_effects": {
      "windy": "Hair and clothing sway realistically in a gentle breeze, leaves or petals drifting in the background.",
      "cinematic_lighting": "Soft golden hour sunlight filtering through, cinematic dust motes floating in the air, drifting background clouds."
    },
    "camera_movements": {
      "zoom_in": "Slow cinematic zoom-in to focus on the character's emotional expression.",
      "pan_left_right": "Slow horizontal panning shot revealing the detailed background atmosphere.",
      "static": "Fixed camera angle focusing entirely on the character's smooth fluid motion."
    },
    "quality_tags": "fluid motion, 60fps, flawless rendering, masterpiece, no morphing, high quality.",
    "negative": "3D render (if 2D), photorealistic, choppy motion, deformed body, morphing artifacts, text, watermark, low frame rate, sudden jumps, flickering, low quality."
  }
};

export interface BookmarkItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;          // Ảnh gốc hoặc ảnh đã phục hồi
  category: string;
  rating?: number;
  year?: number;
  location?: string;
  tags?: string[];
  // --- Thêm các trường AI ---
  restoredImage?: string;    // URL ảnh đã phục hồi
  recognition?: {
    objectName: string;      // Tên hiện vật
    culture: string;         // Văn hóa
    period: string;          // Thời kỳ
    description: string;     // Mô tả chi tiết
    confidence: number;      // Độ tin cậy (0-1)
  };
  isAIRestored: boolean;     // Đánh dấu là kết quả AI
  note?: string;             // Ghi chú cá nhân
  reminder?: {
    date: string;        // ISO string
    note?: string;       // Ghi chú nhắc nhở
    completed?: boolean;
  } | null;
  createdAt: string;
}


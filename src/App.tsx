import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  History,
  Image as ImageIcon,
  Video,
  Sliders,
  Download,
  Layers,
  Play,
  Pause,
  Cpu,
  Copy,
  Check,
  FileUp,
  RefreshCw,
  Music,
  Eye,
  Info,
  HelpCircle,
  FileCheck,
  Trash2,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  AlertTriangle,
  X,
  Maximize2,
  RotateCw,
  StopCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  RestorationConfig,
  VideoConfig,
  PhotoPreset,
  ProgressStep,
  AUTOMATION_JSON,
} from "./types";

import { ImageRestorer } from "./components/ai/ImageRestorer";
import MyCollectionPage from "./app/my-collection/page";
import BookmarkDetailPage from "./app/bookmark/[id]/page";
import StatisticsPage from "./app/statistics/page";
import { BookmarkDetail } from "./components/bookmark/BookmarkDetail";
import { useBookmarks } from "./context/BookmarksContext";
import { requestNotificationPermission, checkReminders } from "./lib/reminderService";
import { ThemeCustomizer } from "./components/settings/ThemeCustomizer";

// Import our pre-generated museum assets
import vintageHanoi from "./assets/images/vintage_hanoi_1920_1781767118317.jpg";
import restoredHanoi from "./assets/images/restored_hanoi_1920_1781767136575.jpg";
import vintageWedding from "./assets/images/vintage_wedding_1950_1781767156297.jpg";
import restoredWedding from "./assets/images/restored_wedding_1950_1781767176448.jpg";
import vintageChildren from "./assets/images/vintage_children_1970_1781767192419.jpg";
import restoredChildren from "./assets/images/restored_children_1970_1781767210370.jpg";

// Pre-configured historical presets
const PRESETS: PhotoPreset[] = [
  {
    id: "preset_1",
    title: "Chân dung Thiếu nữ Bắc Kỳ 1920",
    year: "1920s",
    description: "Thiếu nữ Hà Thành đài các trong trang phục áo dài truyền thống ngũ thân, đầu quấn sọc gấm, chụp tại studio thời kỳ cận đại sơ khai.",
    vintageUrl: vintageHanoi,
    restoredUrl: restoredHanoi,
    defaultConfig: {
      decade: "1920s",
      repairTorn: true,
      repairScratches: true,
      repairWaterSpots: true,
      repairCreases: true,
      repairMold: true,
      faceRestoreIntensity: 85,
      eyeClarity: true,
      hairStrands: true,
      colorizationMode: "vivid",
      customInstructions: "Restore the silk áo dài to a light royal blue shade and enrich traditional background wood textures.",
    },
    defaultVideoConfig: {
      style: "anime_2d",
      action: "blink_and_smile",
      environment: "cinematic_lighting",
      camera: "zoom_in",
    },
  },
  {
    id: "preset_2",
    title: "Hôn Lễ Sài Gòn Hoa Lệ 1950",
    year: "1950s",
    description: "Đám cưới truyền thống pha lẫn chút tân thời Âu Mỹ tại Sài Gòn thập niên 50. Cô dâu mặc áo dài ren lưới trắng cùng voan trùm đầu tao nhã.",
    vintageUrl: vintageWedding,
    restoredUrl: restoredWedding,
    defaultConfig: {
      decade: "1950s",
      repairTorn: true,
      repairScratches: true,
      repairWaterSpots: false,
      repairCreases: true,
      repairMold: false,
      faceRestoreIntensity: 75,
      eyeClarity: true,
      hairStrands: true,
      colorizationMode: "mild",
      customInstructions: "Restore historical sepia tones with gentle pastel lace patterns on the white dress.",
    },
    defaultVideoConfig: {
      style: "pixar_3d",
      action: "wave_hand",
      environment: "cinematic_lighting",
      camera: "pan_left_right",
    },
  },
  {
    id: "preset_3",
    title: "Ký ức Vespa Việt Nam 1970",
    year: "1970s",
    description: "Hai anh em vui đùa hồn nhiên trên chiếc xe máy Vespa Sprint màu cổ vịt tại miền Nam thân thương trước hiên nhà lợp ngói đỏ.",
    vintageUrl: vintageChildren,
    restoredUrl: restoredChildren,
    defaultConfig: {
      decade: "1970s",
      repairTorn: false,
      repairScratches: true,
      repairWaterSpots: true,
      repairCreases: false,
      repairMold: true,
      faceRestoreIntensity: 65,
      eyeClarity: true,
      hairStrands: false,
      colorizationMode: "vivid",
      customInstructions: "Keep the iconic vintage warm Polaroid look while recovering high-fidelity details of the Vespa and clothes.",
    },
    defaultVideoConfig: {
      style: "anime_2d",
      action: "blink_and_smile",
      environment: "windy",
      camera: "static",
    },
  },
];

export default function App() {
  // Navigation Routing in SPA
  const [appView, setAppView] = useState<"workspace" | "restore" | "collection" | "bookmark_detail" | "statistics">("workspace");
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    const handlePush = (e: Event) => {
      const customEvent = e as CustomEvent;
      const href = customEvent.detail?.href;
      if (href) {
        if (href === '/' || href === '/restore') {
          setAppView('restore');
        } else if (href === '/my-collection') {
          setAppView('collection');
        } else if (href === '/statistics') {
          setAppView('statistics');
        } else if (href.startsWith('/bookmark/')) {
          const id = href.split('/').pop();
          if (id) {
            setSelectedBookmarkId(id);
            setAppView('bookmark_detail');
          }
        }
      }
    };

    const handleBack = () => {
      setAppView('collection');
    };

    window.addEventListener('spa-push-navigation', handlePush);
    window.addEventListener('spa-back-navigation', handleBack);
    return () => {
      window.removeEventListener('spa-push-navigation', handlePush);
      window.removeEventListener('spa-back-navigation', handleBack);
    };
  }, []);

  // Preset Selection
  const { bookmarks } = useBookmarks();

  // Yêu cầu quyền thông báo và kiểm tra nhắc nhở định kỳ
  useEffect(() => {
    requestNotificationPermission();
    
    // Kiểm tra ngay khi khởi chạy
    if (bookmarks && bookmarks.length > 0) {
      checkReminders(bookmarks);
    }

    // Set hẹn giờ mỗi 30 giây để kiểm tra và nhắc nhở thời gian thực
    const interval = setInterval(() => {
      if (bookmarks && bookmarks.length > 0) {
        checkReminders(bookmarks);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [bookmarks]);

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  // Pipeline Visibility & Controls State
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  const [showStep6, setShowStep6] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState<boolean>(false);

  const isStepVisible = (stepNum: number) => {
    if (showAllSteps) {
      if (stepNum === 6) return showStep6;
      return true;
    }
    return activeStep === stepNum;
  };

  // Computed state for active image loaded / process active
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const isImageActive = selectedPresetId !== null || customImageBase64 !== null || showAllSteps;

  // Custom User Image States
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Active configurations (derived from preset OR overridden by user sliders)
  const [restorationConfig, setRestorationConfig] = useState<RestorationConfig>({
    ...selectedPreset.defaultConfig,
  });

  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    ...selectedPreset.defaultVideoConfig,
  });

  // Whenever user changes preset, update configs to defaults of that preset
  // Replicate AI dynamically restored image URL
  const [replicateRestoredUrl, setReplicateRestoredUrl] = useState<string | null>(null);
  const [isReplicateProcessing, setIsReplicateProcessing] = useState<boolean>(false);
  const [replicateError, setReplicateError] = useState<string | null>(null);
  const [replicateModelType, setReplicateModelType] = useState<"codeformer" | "gfpgan" | "flux-restore">("flux-restore");

  useEffect(() => {
    if (selectedPresetId) {
      if (selectedPresetId !== "custom") {
        setRestorationConfig({ ...selectedPreset.defaultConfig });
        setVideoConfig({ ...selectedPreset.defaultVideoConfig });
      }
      setReplicateRestoredUrl(null);
      setReplicateError(null);
      setActiveStep(2);
    }
  }, [selectedPresetId]);

  // UI Control States
  const [activeTab, setActiveTab] = useState<"restoration" | "animation" | "palette">("restoration");
  const [outputView, setOutputView] = useState<"comparison" | "video_simulation">("comparison");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Gemini Smart Analysis State
  const [geminiAnalysis, setGeminiAnalysis] = useState<{
    analysisText: string;
    suggestedDecade: string;
    suggestedColors: string[];
    suggestedRepairTags: string[];
    isDemoFallback?: boolean;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Simulated AI progress logger
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);

  // Vinyl Retro Hum Synthesizer States
  const [isVinylPlaying, setIsVinylPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const vinylNodesRef = useRef<{
    crackleSource: AudioWorkletNode | ScriptProcessorNode | null;
    oscillator: OscillatorNode | null;
    gain: GainNode | null;
  } | null>(null);

  // Copy Prompt States
  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // System Time running clock (Year 2026 forced per specification Pt.1)
  const [systemTime, setSystemTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = 2026;
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setSystemTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera Management States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasCameraError, setHasCameraError] = useState<boolean>(false);
  const [isSimulatedStream, setIsSimulatedStream] = useState<boolean>(false);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && cameraStream && !isSimulatedStream) {
      node.srcObject = cameraStream;
      node.play().catch(e => console.log("Callback ref video play start:", e));
    }
  }, [cameraStream, isSimulatedStream]);

  // Before/After slider dragging logic
  const comparisonContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);

  const handleSliderMove = (clientX: number) => {
    if (!comparisonContainerRef.current) return;
    const rect = comparisonContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    isDraggingSlider.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSlider.current) return;
    handleSliderMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDraggingSlider.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingSlider.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Web Audio Dynamic Retro Hum & Vinyl Static Generator
  const toggleVinylAmbient = () => {
    if (isVinylPlaying) {
      // Stop the sound
      if (vinylNodesRef.current) {
        try {
          if (vinylNodesRef.current.oscillator) {
            vinylNodesRef.current.oscillator.stop();
          }
          if (vinylNodesRef.current.crackleSource) {
            vinylNodesRef.current.crackleSource.disconnect();
          }
        } catch (e) {
          console.log(e);
        }
        vinylNodesRef.current = null;
      }
      setIsVinylPlaying(false);
    } else {
      // Start the dynamic classic synthesis
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const mainVolume = ctx.createGain();
        mainVolume.gain.setValueAtTime(0.08, ctx.currentTime);

        // 1. Warm low-frequency motor hum (55Hz / 110Hz warm hum)
        const humOsc = ctx.createOscillator();
        const humGain = ctx.createGain();
        humOsc.type = "sine";
        humOsc.frequency.setValueAtTime(55, ctx.currentTime); // G low hum
        humGain.gain.setValueAtTime(0.3, ctx.currentTime);

        // Add 110Hz warm harmonic
        const humOsc2 = ctx.createOscillator();
        const humGain2 = ctx.createGain();
        humOsc2.type = "sine";
        humOsc2.frequency.setValueAtTime(110, ctx.currentTime);
        humGain2.gain.setValueAtTime(0.1, ctx.currentTime);

        // 2. Dynamic high-frequency crackle/static pops using white/brown noise algorithm
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brown noise filtration
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain

          // Inject random pops/scratches
          if (Math.random() > 0.9998) {
            output[i] += (Math.random() > 0.5 ? 1 : -1) * 0.8;
          }
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 1000;
        noiseFilter.Q.value = 0.8;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);

        // Connections
        humOsc.connect(humGain);
        humGain.connect(mainVolume);

        humOsc2.connect(humGain2);
        humGain2.connect(mainVolume);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(mainVolume);

        mainVolume.connect(ctx.destination);

        // Start playing
        humOsc.start();
        humOsc2.start();
        noiseNode.start();

        vinylNodesRef.current = {
          crackleSource: noiseNode as any,
          oscillator: humOsc,
          gain: mainVolume,
        };

        setIsVinylPlaying(true);
        triggerNotification("🎛️ Đã kích hoạt máy đĩa hát tạp âm cổ!");
      } catch (err) {
        console.warn("Failed to initialize desktop audio synthesis", err);
      }
    }
  };

  // Safe cleaner on unmount
  useEffect(() => {
    return () => {
      if (vinylNodesRef.current) {
        try {
          vinylNodesRef.current.oscillator?.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Helper trigger for sleek alerts
  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Camera Actions & Operations (Chập hoặc Quay từ Camera - Phần 4)
  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    try {
      setIsCameraOpen(true);
      setRecordedVideoUrl(null);
      setRecordedVideoBlob(null);
      setHasCameraError(false);

      // Stop existing stream if any
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsSimulatedStream(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly trigger play to prevent some mobile browsers from pausing on load
        videoRef.current.play().catch(e => console.log("Video stream play started", e));
      }
    } catch (err) {
      console.error("Camera access failed, falling back to Simulated Feed", err);
      setHasCameraError(true);
      setIsSimulatedStream(true);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      triggerNotification("📺 Đã kích hoạt chế độ KÍNH NHÌN CAMERA GIẢ LẬP độ nét cao.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setIsRecording(false);
    setRecordedVideoUrl(null);
    setRecordedVideoBlob(null);
    setHasCameraError(false);
  };

  const capturePhoto = () => {
    if (isSimulatedStream) {
      // Create a gorgeous dynamic custom vintage sepia photo on the fly of historic Vietnam!
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw elegant aged canvas
        ctx.fillStyle = "#201B15";
        ctx.fillRect(0, 0, 640, 640);
        
        ctx.fillStyle = "#EAE3DE";
        ctx.fillRect(30, 30, 580, 580);
        
        // Add sepia vignette overlay
        const grad = ctx.createRadialGradient(320, 320, 120, 320, 320, 320);
        grad.addColorStop(0, "rgba(234, 227, 222, 0.4)");
        grad.addColorStop(0.8, "rgba(181, 138, 85, 0.6)");
        grad.addColorStop(1, "rgba(75, 48, 20, 0.95)");
        ctx.fillStyle = grad;
        ctx.fillRect(30, 30, 580, 580);
        
        // Draw elegant vintage sketch lines to represent historic architecture 
        ctx.strokeStyle = "rgba(100, 70, 40, 0.35)";
        ctx.lineWidth = 2;
        // Turtle Tower / Lake of the Restored Sword silhouette sketch
        ctx.beginPath();
        ctx.moveTo(180, 480);
        ctx.lineTo(460, 480);
        ctx.lineTo(440, 360);
        ctx.lineTo(200, 360);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(220, 360);
        ctx.lineTo(420, 360);
        ctx.lineTo(390, 260);
        ctx.lineTo(250, 260);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "rgba(100, 70, 40, 0.5)";
        ctx.fillRect(295, 200, 50, 60);

        // Grid scan lines and noise
        ctx.strokeStyle = "rgba(40, 20, 5, 0.15)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 25; i++) {
          ctx.beginPath();
          ctx.moveTo(0, Math.random() * 640);
          ctx.lineTo(640, Math.random() * 640);
          ctx.stroke();
        }
        
        // Dynamic watermarks
        ctx.fillStyle = "rgba(75, 48, 20, 0.9)";
        ctx.font = "bold 20px 'Times New Roman', serif";
        ctx.textAlign = "center";
        ctx.fillText("ẢNH CHỤP DI SẢN GIẢ LẬP v2.0", 320, 120);
        
        ctx.font = "italic 15px 'Times New Roman', serif";
        ctx.fillText("Hồ Hoàn Kiếm Thập Niên 1950", 320, 440);
        
        ctx.fillStyle = "rgba(140, 100, 60, 0.7)";
        ctx.font = "12px monospace";
        ctx.fillText(`Mã hóa ảnh cũ: #${new Date().getTime()}`, 320, 520);
        ctx.fillText(`Thời gian thực: ${systemTime || "2026-06-18 UTC"}`, 320, 545);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCustomImageBase64(dataUrl);
        setCustomImageName(`GiaLap_Camera_${new Date().getTime()}.jpg`);
        setSelectedPresetId("custom");
        
        stopCamera();
        triggerNotification("📸 Đã chập chụp ảnh giả lập di sản thành công!");
      }
      return;
    }

    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Ensure the video is playing before capturing frames
    if (video.paused) {
      video.play().catch(e => console.log("Play on capture fail:", e));
    }

    const canvas = document.createElement("canvas");
    
    // Fallback to clientWidth and clientHeight if videoWidth/videoHeight are not fully initialized (returns 0)
    let width = video.videoWidth;
    let height = video.videoHeight;
    if (!width || !height) {
      width = video.clientWidth || 640;
      height = video.clientHeight || 480;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Flip horizontal if front camera is active
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCustomImageBase64(dataUrl);
      setCustomImageName(`Chập_Camera_${new Date().getTime()}.jpg`);
      setSelectedPresetId("custom");
      
      stopCamera();
      triggerNotification("📸 Đã chập chụp ảnh di sản từ camera thành công!");
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedVideoUrl(null);
    setRecordedVideoBlob(null);
    setRecordingSeconds(0);

    if (isSimulatedStream) {
      // Create beautifully animated canvas webm stream for sandbox environment
      const chunks: BlobPart[] = [];
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      
      let stream: MediaStream;
      try {
        stream = (canvas as any).captureStream(12); // 12 FPS
      } catch (e) {
        // Fallback if captureStream not supported
        triggerNotification("⚠️ Trình duyệt của bạn không hỗ trợ ghi luồng Canvas.");
        setIsRecording(false);
        return;
      }

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      } catch (_) {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      let animationId: number;
      const drawSimulatedFrame = () => {
        if (!ctx) return;
        
        // Draw aged cinematic background
        ctx.fillStyle = "#161310";
        ctx.fillRect(0, 0, 400, 400);

        const radial = ctx.createRadialGradient(200, 200, 50, 200, 200, 200);
        radial.addColorStop(0, "#2E241C");
        radial.addColorStop(1, "#0B0907");
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, 400, 400);

        // draw random historic frame countdown
        const currentMilli = new Date().getTime();
        const randSeed = Math.sin(currentMilli);

        // Dynamic historic lines
        ctx.strokeStyle = "rgba(181, 138, 85, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const lineX = Math.abs(randSeed * 400);
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX + randSeed * 20, 400);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.strokeRect(20, 20, 360, 360);

        // Draw animated old reel circle
        ctx.strokeStyle = "rgba(181, 138, 85, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(200, 180, 60 + Math.abs(Math.sin(currentMilli / 200)) * 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(224, 212, 198, 0.9)";
        ctx.font = "italic bold 15px 'Times New Roman', serif";
        ctx.textAlign = "center";
        ctx.fillText("PHIM DI SẢN GIẢ LẬP HÀ NỘI", 200, 290);

        ctx.fillStyle = "#B58A55";
        ctx.font = "10px monospace";
        ctx.fillText(`UTC 2026 • RECORD MODE • ${10 - Math.min(10, Math.floor(currentMilli / 1000) % 10)}s`, 200, 320);

        // Blinking Red Rec Dot
        if (Math.floor(currentMilli / 400) % 2 === 0) {
          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.arc(40, 40, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        animationId = requestAnimationFrame(drawSimulatedFrame);
      };

      animationId = requestAnimationFrame(drawSimulatedFrame);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        cancelAnimationFrame(animationId);
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideoBlob(videoBlob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);

        // Generate automatic frame placeholder of 640x640 representing the video
        const coverCanvas = document.createElement("canvas");
        coverCanvas.width = 640;
        coverCanvas.height = 640;
        const cctx = coverCanvas.getContext("2d");
        if (cctx) {
          cctx.fillStyle = "#1e1b18";
          cctx.fillRect(0, 0, 640, 640);
          cctx.fillStyle = "#B58A55";
          cctx.font = "bold 22px 'Times New Roman', serif";
          cctx.textAlign = "center";
          cctx.fillText("BIỂU TƯỢNG HOÀN THIỆN PHIM DI SẢN", 320, 300);
          cctx.fillStyle = "#a8a29e";
          cctx.font = "12px monospace";
          cctx.fillText("Nhấp Phục Dựng để biên khảo thành phim hoạt họa màu", 320, 340);
          setCustomImageBase64(coverCanvas.toDataURL("image/jpeg"));
          setCustomImageName(`GiaLap_Cover_${new Date().getTime()}.jpg`);
          setSelectedPresetId("custom");
        }

        triggerNotification("🔴 Quay phim giả lập hoàn tất! Bạn có thể sử dụng khung ảnh này để làm video.");
      };

      recorder.start();
      return;
    }

    if (!cameraStream) return;
    
    const chunks: BlobPart[] = [];
    let recorder: MediaRecorder;
    try {
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4"
      ];
      let selectedMimeType = "";
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }
      
      if (selectedMimeType) {
        recorder = new MediaRecorder(cameraStream, { mimeType: selectedMimeType });
      } else {
        recorder = new MediaRecorder(cameraStream);
      }
    } catch (_) {
      recorder = new MediaRecorder(cameraStream);
    }
    
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideoBlob(videoBlob);
      setRecordedVideoUrl(videoUrl);
      setIsRecording(false);
      
      // Auto-extract first frame as cover photograph
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 640;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          setCustomImageBase64(canvas.toDataURL("image/jpeg"));
          setCustomImageName(`Quay_Frame_${new Date().getTime()}.jpg`);
          setSelectedPresetId("custom");
        }
      }
      
      triggerNotification("🔴 Đã quay phim thành công! Chụp khung bìa đã nạp vào studio phục dựng.");
    };
    
    recorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Recording countdown / limit timer (Part 4)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 9) { // auto stop at 10 seconds
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
              mediaRecorderRef.current.stop();
            }
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Handle camera switch front/back
  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isCameraOpen) {
      startCamera(nextMode);
    }
  };

  // Custom File Dropper & Base64 Converter
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      triggerNotification("⚠️ Định dạng tệp không khớp! Vui lòng tải ảnh lên.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageBase64(reader.result as string);
      setCustomImageName(file.name);
      setSelectedPresetId("custom");
      
      // Default modern restoration configs foruploaded items
      setRestorationConfig({
        decade: "1950s",
        repairTorn: true,
        repairScratches: true,
        repairWaterSpots: true,
        repairCreases: true,
        repairMold: true,
        faceRestoreIntensity: 80,
        eyeClarity: true,
        hairStrands: true,
        colorizationMode: "vivid",
        customInstructions: "",
      });
      triggerNotification("📸 Tải ảnh thành công! Đã chuyển sang Xử lý tùy chọn.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  // Clear loaded custom photograph
  const handleClearCustom = () => {
    setCustomImageBase64(null);
    setCustomImageName(null);
    setSelectedPresetId("preset_1");
    triggerNotification("🗑️ Đã xóa tệp tải lên, trở về Chân dung Thiếu nữ Bắc Kỳ.");
  };

  // Positive Prompt Builder based on the exact user format & selections
  const generatePositivePrompt = () => {
    let prompt = "";
    if (activeTab === "restoration" || activeTab === "palette") {
      const eraInsert = restorationConfig.decade || "[Thập_Niên]";
      
      prompt = `High-resolution restoration, de-aging, and modernization of an old, severely damaged photograph from the ${eraInsert}. `;
      
      const repairs: string[] = [];
      if (restorationConfig.repairScratches) repairs.push("deep scratches");
      if (restorationConfig.repairCreases) repairs.push("cracks, creases");
      if (restorationConfig.repairTorn) repairs.push("torn edges");
      if (restorationConfig.repairWaterSpots) repairs.push("water stains");
      if (restorationConfig.repairMold) repairs.push("mold textures");
      
      if (repairs.length > 0) {
        prompt += `Automatically detect and flawlessly repair all physical imperfections, including ${repairs.join(", ")}, and dust spots. `;
      } else {
        prompt += `Flawlessly clean and repair digital dust spots or slight texture grain. `;
      }

      prompt += `Apply advanced face restoration and blind face restoration (GFPGAN/CodeFormer effect) to enhance facial features with an intensity level of ${restorationConfig.faceRestoreIntensity}%, restoring `;
      prompt += `${restorationConfig.eyeClarity ? "excellent eye clarity, refined iris details, " : ""}`;
      prompt += `${restorationConfig.hairStrands ? "flowing hair strands, " : ""}`;
      prompt += `and seamless skin texture realistically without losing the original identity or emotional expression. `;

      if (restorationConfig.colorizationMode === "vivid") {
        prompt += `Colorize the black and white image with natural, realistic, vivid, and historically accurate skin tones, clothing colors, and background environment. `;
      } else if (restorationConfig.colorizationMode === "mild") {
        prompt += `Colorize the black and white image with mild, warm, nostalgic pastel palette, maintaining authentic Indochine tones. `;
      } else {
        prompt += `Maintain a beautiful rich monochrome silver-gelatin black and white palette, balancing deep shadows and high-fidelity historic contrast. `;
      }

      if (restorationConfig.customInstructions) {
        prompt += `Special request: ${restorationConfig.customInstructions}. `;
      }

      prompt += `Avoid oversaturation, color bleeding, and artificial digital gradients. Maintain a balanced contrast with rich details in shadows and highlights. Photorealistic, clean, ultra-sharp focus, 8k UHD, masterpiece, highly detailed textures, studio lighting, look like it was shot today.`;
    } else {
      // Animation positive prompt
      const styleDesc = AUTOMATION_JSON.image_to_video.styles[videoConfig.style];
      const actionDesc = AUTOMATION_JSON.image_to_video.character_actions[videoConfig.action];
      const envDesc = AUTOMATION_JSON.image_to_video.environment_effects[videoConfig.environment];
      const camDesc = AUTOMATION_JSON.image_to_video.camera_movements[videoConfig.camera];

      prompt = `Transform the provided source image into a ${styleDesc}. Bring the character to life with natural, subtle, and highly expressive animation: ${actionDesc} Ambient environment dynamics: ${envDesc} ${camDesc} ${AUTOMATION_JSON.image_to_video.quality_tags}`;
    }
    return prompt;
  };

  const generateNegativePrompt = () => {
    if (activeTab === "restoration" || activeTab === "palette") {
      return `grainy, blurry, distorted, deformed eyes, extra limbs, bad anatomy, oversaturated, fake colors, drawing, painting, canvas, low quality, artifacts, digital noise, cartoonish, plastic skin, crossed eyes, asymmetric face, color bleeding, low-res, compressed image, watermarks, signature, text, out of focus.`;
    } else {
      return AUTOMATION_JSON.image_to_video.negative;
    }
  };

  // Dynamic Prompt translation block (Vietnamese corresponding equivalents)
  const getVietnameseEquivalent = () => {
    if (activeTab === "restoration" || activeTab === "palette") {
      return `[PHỤC CHẾ ẢNH] Phục chế độ phân giải cao và hiện đại hóa một bức ảnh cũ bị hư hỏng từ thập niên ${restorationConfig.decade}. Sửa tất cả khuyết tật vật lý gồm ${
        restorationConfig.repairScratches ? "vết xước dài, " : ""
      }${restorationConfig.repairCreases ? "nếp gấp gãy, " : ""}${
        restorationConfig.repairTorn ? "sứt mẻ rách góc, " : ""
      }. Sử dụng mạng thần kinh nhân tạo để phục dựng mặt (GFP-GAN/CodeFormer) ở cấp độ ${
        restorationConfig.faceRestoreIntensity
      }%, làm rõ mắt, sợi tóc, cấu trúc cơ mặt chân thực. ${
        restorationConfig.colorizationMode === "vivid"
          ? "Phối màu sắc rực rỡ chân thực tự nhiên, đúng khảo cứu lịch sử."
          : restorationConfig.colorizationMode === "mild"
          ? "Tô màu hoài cổ vương chút sắc Đông Dương xưa nhẹ nhàng hoài niệm."
          : "Chế độ đen trắng nghệ thuật giữ hồn mạ bạc dải xám tương phản rộng."
      }`;
    } else {
      return `[HOẠT ẢNH VIDEO] Chuyển đổi bức ảnh lột tả bối cảnh sang phong cách ${
        videoConfig.style === "anime_2d" ? "phim hoạt họa Anime 2D Studio Ghibli ấm áp hoài cổ" : "phim 3D Disney Pixar mịn màng rực rỡ tươi sáng"
      }. Nhân vật thực hiện: ${
        videoConfig.action === "blink_and_smile" ? "chớp mắt nhẹ khẽ cười mỉm ấm áp" : videoConfig.action === "wave_hand" ? "nhìn xung quanh vẫy tay thân ái chào máy quay" : "nói chuyện nhép môi hài hòa tinh tế"
      }. Hiệu ứng bối cảnh: ${
        videoConfig.environment === "windy" ? "gió lay tóc và tà áo bay bổng tự nhiên" : "ánh nắng chiếu xiên kèm các hạt bụi lôi cuốn trong không khí"
      }. Chuyển động góc máy: ${
        videoConfig.camera === "zoom_in" ? "phóng nhẹ dần cận cảnh khuôn mặt" : videoConfig.camera === "pan_left_right" ? "liếc xiên nhẹ ghi nhận chiều dài chiều sâu" : "máy đứng yên"
      }.`;
    }
  };

  // Perform Gemini full automated analysis
  const runGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/restore-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetName: selectedPresetId === "custom" ? null : selectedPreset.title,
          imageBase64: selectedPresetId === "custom" ? customImageBase64 : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Phân tích lỗi từ máy chủ");
      }

      const data = await response.json();
      setGeminiAnalysis(data);

      // Dynamically auto-tune sliders and checkboxes based on GenAI suggestions!
      if (data.suggestedDecade) {
        const matchingDecade = data.suggestedDecade.includes("1920")
          ? "1920s"
          : data.suggestedDecade.includes("1950")
          ? "1950s"
          : data.suggestedDecade.includes("1970")
          ? "1970s"
          : data.suggestedDecade;
          
        setRestorationConfig((prev) => ({
          ...prev,
          decade: matchingDecade,
          // Adapt defects suggested
          repairTorn: data.suggestedRepairTags.some((tag: string) => tag.toLowerCase().includes("rách") || tag.toLowerCase().includes("mép")),
          repairScratches: data.suggestedRepairTags.some((tag: string) => tag.toLowerCase().includes("xước") || tag.toLowerCase().includes("vật lý")),
          repairMold: data.suggestedRepairTags.some((tag: string) => tag.toLowerCase().includes("mốc") || tag.toLowerCase().includes("ố")),
        }));
      }

      triggerNotification("🤖 Trí tuệ Gemini đã quét xong! Tự động tối ưu tham số cấu hình.");
    } catch (err) {
      console.error(err);
      
      // Generate highly robust local analysis when API is down, blocked by sandbox or offline
      const localAnalysis = {
        analysisText: "Đang chạy chế độ phân tích di sản ngoại tuyến (Offline). Bức ảnh chứa chi tiết chân dung lịch sử cổ kính với các vết sờn rách, nấm mốc tự nhiên tích tụ qua thời gian.",
        suggestedDecade: "1950s",
        suggestedColors: ["Màu sồi cổ điển", "Trắng ngà lụa ván", "Xám rêu phong"],
        suggestedRepairTags: ["Vệt sờn rách mép", "Ố vàng nấm mốc", "Vết bẩn cọ sát"],
        isDemoFallback: true
      };

      if (selectedPresetId === "custom") {
        localAnalysis.analysisText = "Phân tích ngoại tuyến: Ảnh tự nạp trực tiếp qua Camera / Tệp tải lên. Hệ thống nhận diện đặc trưng hạt nhiễu lịch sử và tự động khuyến nghị chỉnh phục chế nếp gấp rách, quét vết nấm mốc ẩm.";
      } else if (selectedPreset.title.includes("Hanoi") || selectedPreset.title.includes("1920")) {
        localAnalysis.analysisText = "Phân tích ngoại tuyến: Bức chân dung Đông Dương Bắc Kỳ thập kỷ 1920. Khuyến nghị phục chế độ nhẵn của giấy vẽ cổ xưa, sửa các đốm vỡ nứt ẩm mốc và tái cân bằng sắc xám bạc.";
        localAnalysis.suggestedDecade = "1920s";
        localAnalysis.suggestedColors = ["Vàng tơ tằm cổ", "Đỏ chu sa quạt", "Đen tuyền lụa nội"];
        localAnalysis.suggestedRepairTags = ["Vết cáu nấm mốc", "Lồi lõm nứt giấy", "Cắt góc sờn"];
      } else if (selectedPreset.title.includes("Saigon") || selectedPreset.title.includes("wedding")) {
        localAnalysis.analysisText = "Phân tích ngoại tuyến: Lễ thành hôn xưa Sài Gòn thập thập niên 1950. Khuyến nghị làm nổi các thớ lụa satin mượt mà, phục hồi nét sắc sảo của trang phục áo tân thời Âu-Á cổ.";
        localAnalysis.suggestedDecade = "1950s";
        localAnalysis.suggestedColors = ["Trắng ngà ngọc trai", "Vàng mật ong ấm", "Đen lụa ván"];
        localAnalysis.suggestedRepairTags = ["Xước trầy nếp gãy dọc", "Nứt nấm mốc ẩm", "Bay màu bạc góc"];
      } else if (selectedPreset.title.includes("children") || selectedPreset.title.includes("1970")) {
        localAnalysis.analysisText = "Phân tích ngoại tuyến: Tuổi thơ xưa bên phố xá những năm 1970. Góc chụp tươi vui đời sống, khuyến nghị cân bằng màu phim bạc theo tông màu Polaroid rực rỡ ấm góc.";
        localAnalysis.suggestedDecade = "1970s";
        localAnalysis.suggestedColors = ["Xanh Vespa cổ điển", "Vàng Polaroid rực rỡ", "Nâu xám da thuộc"];
        localAnalysis.suggestedRepairTags = ["Mất góc mất chi tiết", "Đốm ố nấm mốc mờ", "Rung mờ nhòe nét"];
      }

      setGeminiAnalysis(localAnalysis);

      // Auto-tune sliders on client-side too!
      setRestorationConfig((prev) => ({
        ...prev,
        decade: localAnalysis.suggestedDecade,
        repairTorn: true,
        repairScratches: true,
        repairMold: true,
      }));

      triggerNotification("ℹ️ Đang kích hoạt Trình phân tích di sản cục bộ (Offline) thông minh.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulated or real AI Pipeline processing execution
  const executeRestorationPipeline = async () => {
    setIsProcessing(true);
    setOverallProgress(5);
    setOutputView("comparison"); // Pivot to workspace to inspect comparison slider!
    if (!showAllSteps) {
      setActiveStep(4);
    }

    const tasks: { msg: string; weight: number }[] = [
      { msg: "🖨️ Chuẩn bị tệp ảnh di sản hạt màu gốc & Phân chia điểm ảnh...", weight: 15 },
      { msg: "🧪 Chạy giải thuật khôi phục vật lý: Vá nứt, xóa hạt bụi và xử lý rách mép...", weight: 30 },
      { msg: "🔮 Kích hoạt mô hình nén mặt GFPGAN kết hợp CodeFormer tái tạo kết cấu da mắt...", weight: 55 },
      { msg: "🎨 Chạy dải màu AI nội suy tông da chuẩn dã sử, pha trộn phục sức & trường cảnh...", weight: 75 },
      { msg: "⚡ Làm nét vùng mờ rung nhòe thấu kính cổ đại, hoàn thiện Frame thô...", weight: 90 },
      { msg: "🚀 Kết xuất ảnh di sản phục chế vẹn nguyên tinh hoa 8K UHD...", weight: 100 },
    ];

    setProgressSteps([]);
    setReplicateError(null);
    setReplicateRestoredUrl(null);

    // Bắt đầu chạy hiệu ứng tiến trình (suy hao giả lập)
    let currentTaskIdx = 0;
    const interval = setInterval(() => {
      if (currentTaskIdx < tasks.length - 1) {
        const task = tasks[currentTaskIdx];
        setProgressSteps((prev) => [
          ...prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 })),
          { status: "processing" as const, message: task.msg, progress: 100 },
        ]);
        setOverallProgress(task.weight);
        currentTaskIdx++;
      }
    }, 1200);

    try {
      // 1. Xác định ảnh gốc ở dạng Base64
      let base64Image = "";
      if (selectedPresetId === "custom" && customImageBase64) {
        base64Image = customImageBase64;
      } else {
        // Tự động tải preset ảnh gốc và chuyển sang Base64
        const vintageImageUrl = selectedPreset.vintageUrl;
        try {
          const res = await fetch(vintageImageUrl);
          const blob = await res.blob();
          base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          console.warn("Failed to convert preset vintage image to base64, using fallback preset image directly", fetchErr);
        }
      }

      if (!base64Image) {
        throw new Error("Không thể tìm hoặc nạp dữ liệu ảnh gốc để phục dựng.");
      }

      console.log("Calling Replicate backend API...");
      // 2. Gửi yêu cầu thật lên server
      const response = await fetch("/api/restore-replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Image,
          repairScratches: restorationConfig.repairScratches,
          faceRestoreIntensity: restorationConfig.faceRestoreIntensity,
          modelType: replicateModelType
        })
      });

      const result = await response.json();
      clearInterval(interval);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể xử lý yêu cầu phục dựng");
      }

      // 3. Tải trước và tối ưu bộ nhớ đệm hình ảnh phục chế vẹn nguyên
      setProgressSteps((prev) => [
        ...prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 })),
        { status: "processing" as const, message: "⚡ Đang tải trước và tối ưu bộ nhớ đệm hình ảnh phục chế vẹn nguyên...", progress: 85 },
      ]);
      setOverallProgress(95);

      // Thực nạp hình ảnh trước khi tắt màn hình chờ để triệt tiêu độ trễ hiển thị
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = result.restoredImageUrl;
        img.onload = () => {
          console.log("⚡ Image fully preloaded and cached by browser!");
          resolve();
        };
        img.onerror = (e) => {
          console.warn("⚠️ Failed to preload image, continuing with direct render", e);
          resolve();
        };
        setTimeout(() => resolve(), 3000); // Giới hạn 3 giây timeout để không bị kẹt nếu mạng chập chờn
      });

      // 4. Nếu thành công, cập nhật URL ảnh AI phục chế thật!
      setReplicateRestoredUrl(result.restoredImageUrl);
      
      // Hoàn tất tiến trình
      setProgressSteps((prev) => [
        ...prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 })),
        { status: "completed" as const, message: "🚀 Kết xuất ảnh di sản phục chế vẹn nguyên bằng AI Replicate!", progress: 100 },
      ]);
      setOverallProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setSliderPosition(0); // Co giãn hết sang phần phục tạo mới!
        triggerNotification(`✨ Phục chế thực tế thành công bằng Replicate (${result.modelUsed})!`);
      }, 500);

    } catch (err: any) {
      console.warn("⚠️ Replicate live API error, falling back to simulated generation:", err.message);
      clearInterval(interval);
      setReplicateError(err.message);
      
      // Chạy tiếp hiệu ứng hoàn tất giả lập để người dùng có trải nghiệm mượt mà không bị ngắt quãng
      let taskIdx = currentTaskIdx;
      const fallbackInterval = setInterval(() => {
        if (taskIdx < tasks.length) {
          const task = tasks[taskIdx];
          setProgressSteps((prev) => [
            ...prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 })),
            { status: "processing" as const, message: task.msg, progress: 100 },
          ]);
          setOverallProgress(task.weight);
          taskIdx++;
        } else {
          clearInterval(fallbackInterval);
          setProgressSteps((prev) =>
            prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 }))
          );
          setTimeout(() => {
            setIsProcessing(false);
            setSliderPosition(0);
            triggerNotification("✨ Kích hoạt chế độ Phác thảo Phục chế Khảo cổ học của Hệ thống!");
          }, 500);
        }
      }, 1000);
    }
  };

  // Animated Video conversion simulation
  const executeVideoAnimationPipeline = () => {
    setIsProcessing(true);
    setOverallProgress(10);
    setOutputView("video_simulation"); // Pivot to animation player viewport!
    if (!showAllSteps) {
      setActiveStep(4);
    }

    const tasks = [
      { msg: "🎬 Khai thác bối cảnh phẳng, tạo chiều vân sâu ba chiều...", weight: 25 },
      { msg: "🌱 Thiết lập hệ tọa độ chuyển động & mặt nạ đặc tính Ghibli/Pixar...", weight: 50 },
      { msg: "🌪️ Nội suy hạt chuyển động động (gió bay, rêu bụi, bóng nắng mờ)...", weight: 75 },
      { msg: "🎥 Thiết mộc góc quay điện ảnh (Slow Zoom / Pan), xuất 60fps...", weight: 100 },
    ];

    setProgressSteps([]);
    let currentTaskIdx = 0;

    const interval = setInterval(() => {
      if (currentTaskIdx < tasks.length) {
        const task = tasks[currentTaskIdx];
        setProgressSteps((prev) => [
          ...prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 })),
          { status: "processing" as const, message: task.msg, progress: 50 },
        ]);
        setOverallProgress(task.weight);
        currentTaskIdx++;
      } else {
        clearInterval(interval);
        setProgressSteps((prev) =>
          prev.map((t) => ({ ...t, status: "completed" as const, progress: 100 }))
        );
        setTimeout(() => {
          setIsProcessing(false);
          triggerNotification("🎬 Đã dựng hoạt ảnh video thành công!");
        }, 500);
      }
    }, 2000);
  };

  const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerNotification("📋 Đã sao chép vào khay nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Return the configured JSON representing the state as asked in Phần 3
  const getCompiledJSON = () => {
    const customizedJSON = {
      image_restoration: {
        positive_base: "High-resolution restoration, de-aging, and modernization of an old, severely damaged photograph.",
        repair_keywords: `Fix ${restorationConfig.repairScratches ? "scratches, " : ""}${restorationConfig.repairCreases ? "creases, cracks, " : ""}${restorationConfig.repairTorn ? "torn edges, " : ""}${restorationConfig.repairWaterSpots ? "water spots, " : ""}${restorationConfig.repairMold ? "mold, " : ""}and dust spots.`,
        face_enhance: `Apply blind face restoration level ${restorationConfig.faceRestoreIntensity}%, enhance eyes, hair, and facial textures.`,
        colorization: {
          auto_color: restorationConfig.colorizationMode === "vivid" 
            ? "Colorize the black and white image with natural, vivid skin tones and modern historical clothing colors."
            : restorationConfig.colorizationMode === "mild"
            ? "Apply warm nostalgic Indochine pastel tones."
            : "Retain high-contrast monochrome silver shadow details.",
        },
        quality_tags: "Photorealistic, clean, ultra-sharp focus, 8k UHD, look like shot today.",
        negative: "grainy, blurry, distorted, deformed eyes, low quality, mock canvas, plastic skin."
      },
      image_to_video: {
        styles: {
          selected: videoConfig.style,
          description: AUTOMATION_JSON.image_to_video.styles[videoConfig.style]
        },
        character_actions: {
          selected: videoConfig.action,
          description: AUTOMATION_JSON.image_to_video.character_actions[videoConfig.action]
        },
        environment_effects: {
          selected: videoConfig.environment,
          description: AUTOMATION_JSON.image_to_video.environment_effects[videoConfig.environment]
        },
        camera_movements: {
          selected: videoConfig.camera,
          description: AUTOMATION_JSON.image_to_video.camera_movements[videoConfig.camera]
        },
        quality_tags: "60fps, fluid movement, cinematic render, seamless masterpiece.",
        negative: "3D render (if 2D), low frame rate, morphing artifacts, text watermarks."
      }
    };
    return JSON.stringify(customizedJSON, null, 2);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-slate-800 font-sans selection:bg-[#E2D2B5] selection:text-slate-900 overflow-x-hidden pb-12">
      {/* Floating Interactive Alerts */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-[#F5EFE6] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#E2D2B5]/30 text-sm max-w-sm"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP DECORATIVE PANEL: Vintage Archival Label */}
      <header className="border-b border-[#EAE3DE] bg-[#F7F4F0] px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">           
              <span className="text-[10px] tracking-widest font-mono text-emerald-800 bg-[#E8F0E8] px-2 py-0.5 rounded uppercase font-semibold">
                Photo video studio v3.1 - School
              </span>
            </div>
              <h1 className="text-1xl md:text-2xl font-display font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              PHOTO & VIDEO ANIMATION
                </h1>
            <p className="text-xs text-slate-600 max-w-2xl mt-1">
              Xưởng phục hồi ảnh cũ, chuyển thành thước phim 2D hoặc 3D Pixar sắc mịn bằng AI
            </p>
            {/* Top Navigation Bar */}
            <nav className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setAppView("workspace")}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer select-none ${
                  appView === "workspace"
                    ? "bg-amber-950 border-amber-950 text-amber-200 shadow-sm"
                    : "bg-white/70 hover:bg-white border-slate-250 text-slate-700"
                }`}
              >
                🏛️ Xưởng Di Sản
              </button>
              <button
                onClick={() => setAppView("restore")}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer select-none ${
                  appView === "restore"
                    ? "bg-amber-950 border-amber-950 text-amber-200 shadow-sm"
                    : "bg-white/70 hover:bg-white border-slate-250 text-slate-700"
                }`}
              >
                ✨ Phục Hồi Tự Do (AI)
              </button>
              <button
                onClick={() => setAppView("collection")}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer select-none ${
                  appView === "collection"
                    ? "bg-amber-950 border-amber-950 text-amber-200 shadow-sm"
                    : "bg-white/70 hover:bg-white border-slate-250 text-slate-700"
                }`}
              >
                📚 Bộ Sưu Tập
              </button>
              <button
                onClick={() => setAppView("statistics")}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer select-none ${
                  appView === "statistics"
                    ? "bg-amber-950 border-amber-950 text-amber-200 shadow-sm"
                    : "bg-white/70 hover:bg-white border-slate-250 text-slate-700"
                }`}
              >
                📊 Thống Kê
              </button>
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            {/* Theme Settings Panel Button */}
            <button
              onClick={() => setIsThemeSettingsOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all bg-white hover:border-primary border-slate-200 text-slate-700 hover:text-primary shadow-xs cursor-pointer select-none"
              title="Tùy chỉnh giao diện: màu sắc chủ đạo, font chữ, độ đậm đặc hiển thị"
              id="theme-settings-toggle"
            >
              <Sliders className="w-4 h-4 text-primary shrink-0" />
              <span>Giao Diện</span>
            </button>

            {/* Vintage ambient music option */}
            <button
              onClick={toggleVinylAmbient}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                isVinylPlaying
                  ? "bg-[#E2D2B5] border-[#C8B184] text-slate-950 shadow-sm"
                  : "bg-white border-slate-200 hover:border-amber-700/60 text-slate-700"
              }`}
              title="Kích hoạt âm thanh rột rẹt cổ xưa của chiếc máy hát đĩa than"
              id="vinyl-toggle"
            >
              <Music className={`w-4 h-4 ${isVinylPlaying ? "animate-spin" : ""}`} />
              <span>Máy đĩa than {isVinylPlaying ? "đang bật" : "đang tắt"}</span>
              {isVinylPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <span className="text-xs font-mono text-slate-500 bg-[#FAF9F5] border border-[#EAE3DE] px-3 py-2 rounded-xl shadow-xs" title="Thời gian phục chế di sản (Thời gian thực UTC)">
              🕒 {systemTime || "Giờ Hệ Thống: 2026 UTC"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {appView === "workspace" && (
          <>
        
        {/* INTERACTIVE PIPELINE PROCESS CONTROL CENTER */}
        <div className="bg-[#FAF9F5] border border-[#EAE3DE]/90 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isImageActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isImageActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                BẢNG ĐIỀU HƯỚNG QUY TRÌNH PHỤC DỰNG DI SẢN MULTI-STEPS
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                {isImageActive 
                  ? "✓ Ảnh di sản đã được nạp. Toàn bộ quy trình từ Bước 1 đến Bước 5 đã mở khóa và kích hoạt." 
                  : "Hệ thống đang hoạt động ở chế độ Đơn-Góc rút gọn. Vui lòng tải ảnh lên hoặc chọn nhanh ở bên dưới."
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-stretch md:items-end gap-2.5 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2.5 justify-end w-full">
              <button
                onClick={() => setShowAllSteps(!showAllSteps)}
                className={`flex-1 sm:flex-initial px-3 focus:outline-none py-1.8 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center justify-center gap-1.5 ${
                  showAllSteps
                    ? "bg-amber-800 border-amber-900 text-white shadow-sm"
                    : "bg-white border-[#EAE3DE] hover:border-amber-700 hover:bg-[#FAF7F2] text-slate-700"
                }`}
                title="Hiện nhanh toàn bộ các Bước tinh chỉnh, phân tích và so sánh tư liệu"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showAllSteps ? "✓ Tiến Trình Đầy Đủ: ĐANG MỞ" : "Hiện quy trình đầy đủ"}</span>
              </button>
              
              <button
                onClick={() => {
                  const nextState = !showStep6;
                  setShowStep6(nextState);
                  if (nextState) {
                    setActiveStep(6);
                    setShowAllSteps(false);
                  } else if (activeStep === 6) {
                    setActiveStep(4);
                  }
                }}
                className={`flex-1 sm:flex-initial px-3 focus:outline-none py-1.8 rounded-xl text-xs font-semibold cursor-pointer border transition-all flex items-center justify-center gap-1.5 ${
                  showStep6
                    ? "bg-indigo-800 border-indigo-900 text-white shadow-sm"
                    : "bg-white border-[#EAE3DE] hover:border-indigo-700 hover:bg-indigo-50 text-slate-700"
                }`}
                title="Xem bài hướng dẫn lắp ráp Node.js Backend API"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{showStep6 ? "✓ Hướng Dẫn Tích Hợp Backend: ĐANG MỞ" : "Hướng dẫn"}</span>
              </button>
            </div>

            {/* Cầm nang sử dụng button positioned right below the two buttons above */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-900 border border-amber-950 text-[#F5EFE6] hover:bg-amber-800 transition-all shadow-sm cursor-pointer w-full md:w-auto"
              title="Xem cẩm nang sử dụng phần mềm"
              id="help-guide-btn"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Cẩm nang sử dụng</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE SEQUENTIAL STEPPER */}
        <div className="bg-white border border-[#EAE3DE] rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#B58A55] font-bold uppercase block">
                TIẾN TRÌNH THỰC THI CHUẨN KHẢO CỔ HỌC SỐ
              </span>
              <h3 className="text-sm font-semibold text-slate-800 font-display mt-0.5">
                Bảng Phân Phối Từng Bước Tác Vụ
              </h3>
            </div>
            {showAllSteps && (
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.2">
                🟢 Chế độ: Đang hiển thị Quy trình đầy đủ (1-5)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 1, label: "Bước 1: Chọn Ảnh", desc: "Nạp ảnh ảnh cũ", icon: FileUp },
              { id: 2, label: "Bước 2: Tự Hiệu Chỉnh", desc: "Thông số phục dựng", icon: Sliders },
              { id: 3, label: "Bước 3: Chạy AI", desc: "Quét màng phục dựng", icon: Cpu },
              { id: 4, label: "Bước 4: Thành Phẩm", desc: "Thước phim so sánh", icon: Sparkles },
              { id: 5, label: "Bước 5: API Payload", desc: "Biên dịch cấu trúc JSON", icon: Layers },
              { id: 6, label: "Bước 6: Backend Manual", desc: "Mã nguồn cài đặt npx", icon: Info },
            ].map((st) => {
              const IconComp = st.icon;
              const isActive = showAllSteps 
                ? (st.id !== 6 || showStep6) 
                : (activeStep === st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setActiveStep(st.id);
                    if (st.id === 6) {
                      setShowStep6(true);
                      setShowAllSteps(false);
                    } else if (st.id === 1) {
                      setShowStep6(false);
                      setShowAllSteps(false);
                    } else {
                      setShowStep6(false);
                      setShowAllSteps(false);
                    }
                  }}
                  className={`relative p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between h-24 ${
                    isActive
                      ? "bg-amber-900 border-amber-950 text-[#F5EFE6] shadow-sm transform -translate-y-0.5 font-bold"
                      : "bg-[#FAF9F5] border-[#EAE3DE] hover:border-amber-700 text-slate-700 hover:bg-white"
                  }`}
                  id={`stepper-btn-${st.id}`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-800 text-white' : 'bg-white border border-[#EAE3DE] text-[#B58A55] group-hover:text-amber-700'}`}>
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className={`text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded ${isActive ? 'bg-amber-950/40 text-amber-300' : 'bg-slate-200/50 text-slate-500'}`}>
                      ST_0{st.id}
                    </span>
                  </div>
                  
                  <div className="mt-2.5">
                    <p className={`text-xs font-bold font-display tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {st.label}
                    </p>
                    <p className={`text-[10px] truncate mt-1 leading-none ${isActive ? 'text-amber-200/80' : 'text-slate-400 font-medium'}`}>
                      {st.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PRESET & CUSTOM IMAGE SECTOR */}
        {(isStepVisible(1) || !isImageActive) && (
          <section className="mb-8" id="image-preset-section">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#B58A55] font-semibold flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Bước 1: Chọn mẫu ảnh gốc hoặc tải lên file
            </h3>
            {customImageBase64 && (
              <button
                onClick={handleClearCustom}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 cursor-pointer"
                title="Khôi phục trạng thái ban đầu"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh tự tải
              </button>
            )}
          </div>

          {!isImageActive ? (
            /* SIMPLE VIEW: Highly Polished Center Drop Area and Presets Preview Trigger */
            <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-[#EAE3DE] shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[9px] font-mono tracking-widest text-[#B58A55] font-bold uppercase block">
                  ⚙️ CƠ CHẾ KHỞI CHẠY HỌC THUẬT QUANG HỌC
                </span>
                <h4 className="text-base font-semibold text-slate-800">
                  NẠP HỒ SƠ ẢNH CŨ ĐỂ MỞ KHÓA THIẾT BỊ PHỤC CHẾ
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                  Để màn hình thon gọn tinh khiết, các Bước tiếp theo đã được ẩn đi. Vui lòng nạp một ảnh cũ, chụp trực tiếp từ camera, hoặc chọn tệp mẫu dưới đây để bắt đầu.
                </p>
              </div>

              {/* CENTERED LARGE DROPAREA */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all min-h-[220px] cursor-pointer ${
                  isDragging
                    ? "border-[#B58A55] bg-[#FAF7F2]"
                    : "border-[#EAE3DE] hover:border-slate-400 bg-white"
                }`}
                id="file-dropzone-empty"
              >
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-[#FAF7F2] rounded-full mb-3 text-amber-800 border border-[#EAE3DE]/60 shadow-inner">
                    <FileUp className="w-6 h-6 animate-bounce" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Kéo thả file ảnh cũ cần phục hồi vào đây</p>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                    Hỗ trợ các định dạng mẫu chuẩn JPG, PNG, WEBP độ phân giải sắc nét.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3 mt-5">
                    <label className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Chọn file từ Thiết Bị</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      onClick={() => { setCameraMode("photo"); startCamera(); }}
                      className="px-4 py-2 bg-white border border-[#EAE3DE] hover:border-amber-700/60 hover:bg-[#FAF7F2] text-slate-700 font-medium text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-800" />
                      <span>Sử dụng thực tế Camera</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[#EAE3DE] text-center">
                <span className="text-[11px] text-slate-400 block mb-3 font-semibold tracking-wider uppercase font-mono">
                  Hoặc nhấp chọn nhanh mẫu ảnh cũ có sẵn:
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className="group relative overflow-hidden text-left bg-[#FAF9F5]/40 hover:bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3DE] hover:border-amber-700 transition-all text-xs cursor-pointer"
                    >
                      <div className="aspect-video w-full rounded-lg bg-slate-100 mb-1.5 overflow-hidden relative border border-[#EAE3DE]/60">
                        <img
                          src={preset.vintageUrl}
                          alt={preset.title}
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1 left-1 bg-black/60 text-[#FAF7F2] text-[8px] font-mono px-1 py-0.2 rounded">
                          {preset.year}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-800 block truncate">{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* FULL WORKFLOW VIEW: Grid layout for Custom Upload + 3 Presets and easy toggling */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* CUSTOM IMAGE DROPAREA */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed bg-white p-4 flex flex-col items-center justify-center text-center transition-all min-h-[190px] ${
                  isDragging
                    ? "border-[#B58A55] bg-[#FAF7F2]"
                    : customImageBase64
                    ? "border-emerald-600/50 bg-[#F4FAF5]"
                    : "border-[#EAE3DE] hover:border-slate-400"
                }`}
                id="file-dropzone"
              >
                {customImageBase64 ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="aspect-square w-24 rounded-lg bg-slate-100 mb-2 overflow-hidden border border-[#EAE3DE] relative shadow-xs">
                      <img
                        src={customImageBase64}
                        alt={customImageName || "Custom"}
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium font-mono truncate max-w-[150px]">
                      {customImageName || "Custom uploaded"}
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1">Chế Độ Di Vật Tự Chọn</span>
                    
                    <div className="flex gap-2 mt-3">
                      <label className="text-[10px] text-amber-800 hover:text-amber-900 font-medium hover:underline cursor-pointer">
                        Chọn ảnh khác
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-slate-300 text-[10px]">|</span>
                      <button
                        onClick={() => { setCameraMode("photo"); startCamera(); }}
                        className="text-[10px] text-amber-800 hover:text-amber-900 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Chụp lại camera</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="p-2.5 bg-[#FAF7F2] rounded-full mb-2.5 text-amber-800 border border-[#EAE3DE]">
                      <FileUp className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">Tải ảnh di sản lên</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[140px] leading-relaxed">
                      Kéo thả file ảnh hoặc lựa chọn các phương thức thu thập dưới đây.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full max-w-[180px]">
                      <label className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-medium cursor-pointer transition-colors shadow-xs text-center">
                        Duyệt ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      
                      <button
                        onClick={() => { setCameraMode("photo"); startCamera(); }}
                        className="flex-1 py-1.5 bg-[#EAE3DE] hover:bg-[#DED7D2] text-slate-800 rounded-lg text-[10px] font-medium transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        title="Chụp ảnh gốc trực tiếp qua camera"
                      >
                        <Camera className="w-3 h-3 text-amber-900" />
                        <span>Sử dụng Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {PRESETS.map((preset) => {
                const isActive = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`relative overflow-hidden text-left bg-white p-4 rounded-xl border transition-all group hover:shadow-md ${
                      isActive
                        ? "border-amber-700 bg-[#FAF7F2] ring-1 ring-amber-700/40"
                        : "border-[#EAE3DE] hover:border-slate-400"
                    }`}
                    id={`preset-btn-${preset.id}`}
                  >
                    <div className="aspect-square w-full rounded-lg bg-slate-100 mb-3 overflow-hidden relative">
                      <img
                        src={preset.vintageUrl}
                        alt={preset.title}
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-[#FAF7F2] text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                        {preset.year}
                      </div>
                    </div>
                    <h4 className="font-medium text-xs text-slate-900 line-clamp-1">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {isImageActive && !showAllSteps && (
            <div className="mt-6 flex justify-end border-t border-dashed border-[#EAE3DE] pt-5">
              <button
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 bg-amber-900 border border-amber-950 hover:bg-amber-800 text-[#F5EFE6] rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-98"
                id="next-step-1"
              >
                <span>Mở Bước 2: Tinh Nhập Thông Số</span>
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>
        )}

        {/* WORK BENCH ROW */}
        {isImageActive && (
          <>
            {(showAllSteps || activeStep === 2 || activeStep === 3 || activeStep === 4) && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: SLIDERS & PARAMETERS SIDEBAR */}
            {(showAllSteps || activeStep === 2 || activeStep === 3) && (
              <div className={`bg-white border border-[#EAE3DE] rounded-2xl shadow-sm overflow-hidden sticky top-6 ${
                showAllSteps ? "lg:col-span-5" : "lg:col-span-6"
              }`}>
                
                {(showAllSteps || activeStep === 2) && (
                  <>
                    {/* Standardized process step header */}
                    <div className="bg-[#FAF9F5] border-b border-[#EAE3DE] px-5 py-3 flex items-center justify-between">
                      <span className="text-[11px] tracking-wider font-mono text-[#B58A55] font-bold uppercase flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-700" />
                        Bước 2: Tinh chỉnh thông số phục dựng
                      </span>
                    </div>

            {/* Sidebar header / Toggle tabs */}
            <div className="flex border-b border-[#EAE3DE] bg-[#FDFDFB]">
              <button
                onClick={() => setActiveTab("restoration")}
                className={`flex-1 py-3 text-center font-display text-[11px] sm:text-xs font-semibold border-b-2 flex items-center justify-center gap-1 transition-colors ${
                  activeTab === "restoration"
                    ? "border-amber-800 text-amber-950 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-[#F9F7F3]"
                }`}
                id="tab-btn-restoration"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-700" />
                <span>1. Phục Chế</span>
              </button>
              <button
                onClick={() => setActiveTab("animation")}
                className={`flex-1 py-3 text-center font-display text-[11px] sm:text-xs font-semibold border-b-2 flex items-center justify-center gap-1 transition-colors ${
                  activeTab === "animation"
                    ? "border-amber-800 text-amber-950 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-[#F9F7F3]"
                }`}
                id="tab-btn-animation"
              >
                <Video className="w-3.5 h-3.5 text-indigo-700" />
                <span>2. Hoạt Họa</span>
              </button>
              <button
                onClick={() => setActiveTab("palette")}
                className={`flex-1 py-3 text-center font-display text-[11px] sm:text-xs font-semibold border-b-2 flex items-center justify-center gap-1 transition-colors ${
                  activeTab === "palette"
                    ? "border-amber-800 text-amber-950 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-[#F9F7F3]"
                }`}
                id="tab-btn-palette"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Sắc Màu</span>
              </button>
            </div>

            {/* Sidebar Option Body */}
            <div className="p-6">
              
              {/* TAB 1: PHOTOGRAPHIC RESTORATION FIELDS */}
              {activeTab === "restoration" && (
                <div className="space-y-6">
                  {/* Era picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 font-mono">
                      🗓️ Thập kỷ của ảnh gốc [Thập_Niên]
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {["1890s", "1920s", "1950s", "1970s"].map((dec) => (
                        <button
                          key={dec}
                          onClick={() => setRestorationConfig((p) => ({ ...p, decade: dec }))}
                          className={`text-xs py-2 px-1 rounded-lg border font-medium text-center transition-colors ${
                            restorationConfig.decade === dec
                              ? "bg-amber-950 border-amber-950 text-[#F5EFE6] shadow-sm font-bold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {dec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Physical Defect Checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 font-mono">
                      🩹 Sửa khuyết tật vật lý tự động
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-[#FAF7F2] border border-slate-200 rounded-lg cursor-pointer text-xs transition-colors">
                        <input
                          type="checkbox"
                          checked={restorationConfig.repairScratches}
                          onChange={(e) =>
                            setRestorationConfig((p) => ({ ...p, repairScratches: e.target.checked }))
                          }
                          className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="text-slate-700">Vết rách, trầy xước</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-[#FAF7F2] border border-slate-200 rounded-lg cursor-pointer text-xs transition-colors">
                        <input
                          type="checkbox"
                          checked={restorationConfig.repairCreases}
                          onChange={(e) =>
                            setRestorationConfig((p) => ({ ...p, repairCreases: e.target.checked }))
                          }
                          className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="text-slate-700">Nếp nứt gãy gấp</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-[#FAF7F2] border border-slate-200 rounded-lg cursor-pointer text-xs transition-colors">
                        <input
                          type="checkbox"
                          checked={restorationConfig.repairTorn}
                          onChange={(e) =>
                            setRestorationConfig((p) => ({ ...p, repairTorn: e.target.checked }))
                          }
                          className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="text-slate-700">Mé mép sứt góc</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-[#FAF7F2] border border-slate-200 rounded-lg cursor-pointer text-xs transition-colors">
                        <input
                          type="checkbox"
                          checked={restorationConfig.repairMold}
                          onChange={(e) =>
                            setRestorationConfig((p) => ({ ...p, repairMold: e.target.checked }))
                          }
                          className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="text-slate-700">Ố vàng bẩn mốc</span>
                      </label>
                    </div>
                  </div>

                  {/* Facial Reconstruction - GFP-GAN Sliders */}
                  <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-amber-900 font-mono">
                        👤 Phục hồi mặt (GFPGAN / CodeFormer)
                      </span>
                      <span className="text-xs font-bold text-amber-800">
                        {restorationConfig.faceRestoreIntensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={restorationConfig.faceRestoreIntensity}
                      onChange={(e) =>
                        setRestorationConfig((p) => ({
                          ...p,
                          faceRestoreIntensity: parseInt(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-800 hover:cursor-pointer"
                    />
                    <p className="text-[10px] text-amber-800/80 mt-1.5 leading-relaxed">
                      Sử dụng trí tuệ nhân tạo chuyên sâu định nghĩa hốc mắt, kẽ tóc, rãnh mi giúp người quá cố bừng sáng mà không méo nhân dạng.
                    </p>

                    <div className="flex gap-4 mt-3 pt-3 border-t border-amber-200/40">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={restorationConfig.eyeClarity}
                          onChange={(e) =>
                            setRestorationConfig((p) => ({ ...p, eyeClarity: e.target.checked }))
                          }
                          className="rounded text-amber-800 focus:ring-amber-500"
                        />
                        <span className="text-amber-900 font-medium font-mono text-[11px]">Làm rõ mống mắt</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={restorationConfig.hairStrands}
                          onChange={(e) =>
                            setRestorationConfig((p) => ({ ...p, hairStrands: e.target.checked }))
                          }
                          className="rounded text-amber-800 focus:ring-amber-500"
                        />
                        <span className="text-amber-900 font-medium font-mono text-[11px]">Nét tơ sợi tóc</span>
                      </label>
                    </div>

                    {/* Replicate AI Model Platform Selector */}
                    <div className="mt-3.5 pt-3.5 border-t border-amber-200/50">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-amber-800 uppercase block mb-2">
                        ⚙️ Thuật Toán Replicate Phục Dựng
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReplicateModelType("flux-restore")}
                          className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer text-left flex justify-between items-center ${
                            replicateModelType === "flux-restore"
                              ? "bg-amber-950 text-[#FAF7F2] border-amber-950 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:border-amber-800"
                          }`}
                        >
                          <span>Flux Restore (Đa năng phục chế)</span>
                          {replicateModelType === "flux-restore" && <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest font-sans">Active</span>}
                        </button>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReplicateModelType("codeformer")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                              replicateModelType === "codeformer"
                                ? "bg-amber-950 text-[#FAF7F2] border-amber-950 shadow-xs"
                                : "bg-white text-slate-600 border-slate-200 hover:border-amber-800"
                            }`}
                          >
                            CodeFormer (Mặt)
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplicateModelType("gfpgan")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                              replicateModelType === "gfpgan"
                                ? "bg-amber-950 text-[#FAF7F2] border-amber-950 shadow-xs"
                                : "bg-white text-slate-600 border-slate-200 hover:border-amber-800"
                            }`}
                          >
                            GFPGAN v1.4 (Chân dung)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colorization Mode selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                      🎨 Công nghệ Tô Màu Di Bản
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "bw", label: "Đen trắng cổ điển" },
                        { id: "mild", label: "Đông Dương pastel" },
                        { id: "vivid", label: "Gam rực rỡ 8K" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            setRestorationConfig((p) => ({
                              ...p,
                              colorizationMode: item.id as any,
                            }))
                          }
                          className={`text-[10px] p-2 rounded-lg border font-medium text-center leading-tight transition-colors ${
                            restorationConfig.colorizationMode === item.id
                              ? "bg-amber-900 border-amber-900 text-white font-bold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Custom instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                      ✍️ Yêu cầu vẽ lại chi tiết (Màu áo, bối cảnh)
                    </label>
                    <textarea
                      value={restorationConfig.customInstructions}
                      onChange={(e) =>
                        setRestorationConfig((p) => ({ ...p, customInstructions: e.target.value }))
                      }
                      placeholder="Ví dụ: Giữ nón lá ngả vàng ấm, vẽ lại viền thêu đỏ rực rỡ trên tà áo dài..."
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-700"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGE TO VIDEO ANIMATION BUILDER */}
              {activeTab === "animation" && (
                <div className="space-y-6">
                  {/* Selection Style 2D Ghibli vs 3D Pixar */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3.5 font-mono">
                      🎭 Thể loại hoạt hóa Điện Ảnh
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setVideoConfig((p) => ({ ...p, style: "anime_2d" }))}
                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                          videoConfig.style === "anime_2d"
                            ? "bg-slate-900 border-slate-900 text-[#FAF7F2]"
                            : "border-slate-200 bg-white hover:border-slate-400 text-slate-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono block text-[#B58A55] tracking-wider uppercase mb-1 font-bold">
                          Phong cách 2D
                        </span>
                        <h4 className="font-semibold text-xs mb-1">Anime / Studio Ghibli</h4>
                        <p className="text-[9px] text-slate-400 leading-relaxed max-w-[130px]">
                          Cảm hứng mộc mạc Kyoto gợn nét bút tay hoài cổ, lay động lãng mạn.
                        </p>
                      </button>

                      <button
                        onClick={() => setVideoConfig((p) => ({ ...p, style: "pixar_3d" }))}
                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                          videoConfig.style === "pixar_3d"
                            ? "bg-slate-900 border-slate-900 text-[#FAF7F2]"
                            : "border-slate-200 bg-white hover:border-slate-400 text-slate-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono block text-emerald-500 tracking-wider uppercase mb-1 font-bold">
                          Phong cách 3D
                        </span>
                        <h4 className="font-semibold text-xs mb-1">Disney / Pixar render</h4>
                        <p className="text-[9px] text-slate-400 leading-relaxed max-w-[130px]">
                          Vân khối đất sét mịn màng căng bóng, đôi mắt to ngây thơ phát sáng.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Character Movements / Actions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                      🎬 Cử động đặc tính của nhân vật
                    </label>
                    <div className="space-y-1.5/2">
                      {[
                        { id: "blink_and_smile", label: "💡 Chớp mắt nhịp thở tự nhiên & cười mỉm", hint: "Biểu cảm lãng mạn, nháy mi từng chu kỳ." },
                        { id: "wave_hand", label: "👋 Ngước nhìn ngơ ngác & vẫy tay chào thân ái", hint: "Cơ động lôi cuốn phù hợp kể chuyện cổ tích." },
                        { id: "talking", label: "🗣️ Khép mở miệng khớp khẩu hình (Lip-sync)", hint: "Công nghệ nạp lồng tiếng thuyết minh di sản." },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setVideoConfig((p) => ({ ...p, action: item.id as any }))}
                          className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                            videoConfig.action === item.id
                              ? "bg-[#FAF7F2] border-amber-800 text-slate-900 font-medium"
                              : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-medium block">{item.label}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{item.hint}</span>
                          </div>
                          {videoConfig.action === item.id && (
                            <span className="w-2 h-2 bg-amber-800 rounded-full"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Background dynamics */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                      🍂 Động lực phong cảnh bối cảnh
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setVideoConfig((p) => ({ ...p, environment: "windy" }))}
                        className={`py-2.5 px-3 rounded-lg border text-xs text-left font-medium transition-colors ${
                          videoConfig.environment === "windy"
                            ? "bg-slate-900 border-slate-900 text-white font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        🌪️ Chướng khí: Lay tà áo tóc
                      </button>
                      <button
                        onClick={() => setVideoConfig((p) => ({ ...p, environment: "cinematic_lighting" }))}
                        className={`py-2.5 px-3 rounded-lg border text-xs text-left font-medium transition-colors ${
                          videoConfig.environment === "cinematic_lighting"
                            ? "bg-slate-900 border-slate-900 text-white font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        ☀️ Ánh xiên dột nhẹ & tơ bụi bốc
                      </button>
                    </div>
                  </div>

                  {/* Panoramic camera movements */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 font-mono">
                      🎥 Di chuyển của ống kính máy ảnh
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "zoom_in", label: "🔍 Zoom ghé" },
                        { id: "pan_left_right", label: "↔️ Pan liếc xiên" },
                        { id: "static", label: "🔒 Đóng góc tĩnh" },
                      ].map((camItem) => (
                        <button
                          key={camItem.id}
                          onClick={() => setVideoConfig((p) => ({ ...p, camera: camItem.id as any }))}
                          className={`py-2 px-1 rounded-lg border text-xs text-center font-medium transition-colors ${
                            videoConfig.camera === camItem.id
                              ? "bg-[#E2D2B5] border-[#C8B184] text-slate-950 font-bold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {camItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "palette" && (
                <div className="space-y-5 animate-[fadeIn_0.25s_ease-out]">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bảng Màu Nhã Nhặn hình ảnh
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                      Những tổ hợp sắc màu nhã nhặn phác họa từ chất liệu tranh lụa cổ, hoàng thành Huế và nét rêu phong di sản Việt Nam. Click từng màu để copy HEX, hoặc nhấn nút vàng để nạp trực tiếp vào ô Lời Nhắc AI tùy chỉnh.
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                    {[
                      {
                        name: "Lụa Cổ Phong (Classic Silk)",
                        desc: "Mộng lụa thô sơ thế kỷ trước, nhuộm từ vỏ cây trầm lắng và nhụy cúc thanh tú.",
                        prompt: "Màu sắc nhã nhặn của Lụa Cổ Phong: nền ngọc trai dịu mát (#FAF6EE), tà áo xưa màu lụa thô cổ (#E8D3B9), trang sức vàng ong trầm (#D09F6C), chi tiết đất đỏ nung (#A66C44) và vân gỗ sưa ấm áp (#4A3525).",
                        colors: [
                          { hex: "#FAF6EE", name: "Bạch Ngọc" },
                          { hex: "#E8D3B9", name: "Lụa Thô" },
                          { hex: "#D09F6C", name: "Vàng Sáp" },
                          { hex: "#A66C44", name: "Đất Đỏ" },
                          { hex: "#4A3525", name: "Gỗ Sưa" }
                        ]
                      },
                      {
                        name: "Hoàng Phái Huế (Imperial Court)",
                        desc: "Sắc cung đình thanh tao nhã nhặn, dung hoà giữa dải tím cẩm hoài cổ và phấn hồng dệt gấm.",
                        prompt: "Phối màu Hoàng Phái Huế nhã nhặn: hồng phấn dệt gấm nhạt mộc mạc (#F1E5E4), kim sa hoàng triều nhu hòa (#FCEFD2), đồng cổ thô (#C59A5F), tím mận trầm mặc nhã nhặn (#7E3E5B), bóng thạch anh đen huyền bí hoài cổ (#2D212A).",
                        colors: [
                          { hex: "#F1E5E4", name: "Hồng Phấn" },
                          { hex: "#FCEFD2", name: "Hoàng Kim" },
                          { hex: "#C59A5F", name: "Đồng Cổ" },
                          { hex: "#7E3E5B", name: "Tím Mận" },
                          { hex: "#2D212A", name: "Thạch Anh" }
                        ]
                      },
                      {
                        name: "Mộc Đông Dương (Indochine)",
                        desc: "Tông màu hoài cổ tinh tế của những bức tường vôi ố vàng và rêu song cửa xanh xưa cũ.",
                        prompt: "Sắc thái Mộc Đông Dương nhã nhặn: tường vôi cũ thời gian (#FAFAF7), sơn vàng hoài niệm Indochine (#EFE5C3), xanh rêu song cửa gỗ cổ (#8CA685), mái ngói đất nung phong rêu (#9D5A3C) và vân gỗ mun đen mun trầm ấm (#2E382F).",
                        colors: [
                          { hex: "#FAFAF7", name: "Vôi Trắng" },
                          { hex: "#EFE5C3", name: "Vàng Pháp" },
                          { hex: "#8CA685", name: "Xanh Rêu" },
                          { hex: "#9D5A3C", name: "Mái Ngói" },
                          { hex: "#2E382F", name: "Gỗ Mun" }
                        ]
                      },
                      {
                        name: "Trúc Thanh Lâm (Bamboo Dew)",
                        desc: "Tổ hợp dịu mát cỏ lá xanh tơ mờ mịt trong sương sớm núi rừng yên ả phong vị thanh trúc.",
                        prompt: "Màu sắc tươi mát nhã nhặn Trúc Thanh Lâm: sương sớm thanh khiết (#F4F6F0), lam lục khói mỏng (#D1DAC3), rặng trúc mờ nghệ thuật xanh trúc chi (#869D7A), diệp lục sâu lắng (#536F4C) và bóng lá rừng trầm mặc (#2B3827).",
                        colors: [
                          { hex: "#F4F6F0", name: "Sương Khói" },
                          { hex: "#D1DAC3", name: "Lam Lụa" },
                          { hex: "#869D7A", name: "Trúc Chi" },
                          { hex: "#536F4C", name: "Diệp Lục" },
                          { hex: "#2B3827", name: "Vân Rừng" }
                        ]
                      },
                      {
                        name: "Trà Chiều Thu (Autumn Tea)",
                        desc: "Khoảng lặng tĩnh mịch lúc giao thu, sắc men sứ ngọc hòa trong nhành cúc ngả úa.",
                        prompt: "Hồn cốt mùa thu Trà Chiều Thu nhã nhặn: sứ bạch thanh tao nhã nhặn (#FCF9F3), vân thạch xám xước mộc (#E6DCD2), nước trà hoa lài ngả vàng dịu (#C3A68F), lá rụng màu hạt dẻ (#7A5C43) và mực nho đen đậm chất thi họa cổ điện (#1F1B18).",
                        colors: [
                          { hex: "#FCF9F3", name: "Sứ Bạch" },
                          { hex: "#E6DCD2", name: "Vân Thạch" },
                          { hex: "#C3A68F", name: "Trà Nhài" },
                          { hex: "#7A5C43", name: "Lá Khô" },
                          { hex: "#1F1B18", name: "Mực Nho" }
                        ]
                      }
                    ].map((pal, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 transition-all hover:bg-white hover:shadow-xs">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h5 className="text-[11px] font-bold text-slate-800 font-sans">{pal.name}</h5>
                            <p className="text-[10px] text-slate-400 leading-tight block">{pal.desc}</p>
                          </div>
                        </div>

                        {/* Color strip */}
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          {pal.colors.map((col, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => {
                                navigator.clipboard.writeText(col.hex);
                                triggerNotification(`📋 Đã sao chép mã màu ${col.name} (${col.hex})!`);
                              }}
                              className="group flex flex-col items-center gap-1 cursor-pointer"
                              title={`Copy mã màu ${col.hex}`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border border-slate-200/60 shadow-inner group-hover:scale-105 transition-transform"
                                style={{ backgroundColor: col.hex }}
                              ></div>
                              <span className="text-[8px] font-mono font-bold text-slate-700 leading-none truncate w-full text-center">{col.hex}</span>
                              <span className="text-[8px] text-slate-400 scale-90 leading-none truncate w-full text-center">{col.name}</span>
                            </button>
                          ))}
                        </div>

                        {/* Apply Preset instruction helper */}
                        <button
                          onClick={() => {
                            setRestorationConfig((p) => ({
                              ...p,
                              customInstructions: pal.prompt
                            }));
                            triggerNotification(`🎨 Đã nạp phối màu nhã nhặn '${pal.name}' vào ô Hướng dẫn AI!`);
                          }}
                          className="w-full mt-1.5 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3 h-3 text-amber-700" />
                          <span>Áp dụng vào Lời Nhắc AI phục chế</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div> {/* closes <div className="p-6"> of Step 2 */}
                  </>
                )}

                {!showAllSteps && activeStep === 2 && (
                  <div className="border-t border-dashed border-[#EAE3DE] flex justify-between items-center bg-[#FAF9F5] p-5 animate-[fadeIn_0.2s_ease-out]">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-amber-700 hover:bg-[#FAF7F2] text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>← Quay lại Chọn Ảnh</span>
                    </button>
                    <button
                      onClick={() => setActiveStep(3)}
                      className="px-5 py-2.5 bg-amber-900 border border-amber-950 hover:bg-amber-800 text-[#F5EFE6] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                    >
                      <span>Bước 3: Chạy AI Phục Chế →</span>
                      <Cpu className="w-3.5 h-3.5 text-amber-200" />
                    </button>
                  </div>
                )}

                {(showAllSteps || activeStep === 3) && (
                  <div className={`${!showAllSteps ? "p-6" : "mt-8 pt-6 border-t border-[#EAE3DE] p-6 text-left"}`}>
                    {/* ACTION EXECUTE TRIGGERS */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 pb-1">
                        <span className="text-[11px] tracking-wider font-mono text-[#B58A55] font-bold uppercase flex items-center gap-1">
                          ⚡ Bước 3: Chẩn đoán & Kích hoạt phục dựng
                        </span>
                      </div>
                <div className="flex gap-2.5">
                  {/* Gemini Smart assistance analyzer */}
                  <button
                    onClick={runGeminiAnalysis}
                    disabled={isAnalyzing || isProcessing}
                    className="flex-1 bg-white hover:bg-[#FAF7F2] border border-amber-800/60 text-amber-900 py-3.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:bg-[#FAF7F2]"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini đang phân tích...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Trợ lý Gemini quét hình ảnh</span>
                      </>
                    )}
                  </button>

                  {/* Primary Render trigger */}
                  <button
                    onClick={activeTab === "animation" ? executeVideoAnimationPipeline : executeRestorationPipeline}
                    disabled={isProcessing || isAnalyzing}
                    className="flex-[1.4] bg-slate-900 hover:bg-slate-800 text-[#FAF7F2] py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      {activeTab === "animation" ? "Dựng Video Màn Ảnh" : "Chạy Phục Chế Phục Bản"}
                    </span>
                  </button>
                </div>

                <div className="rounded-xl bg-[#FAF7F2] p-3 text-[11px] text-amber-900 border border-amber-200/40 flex items-start gap-2.5 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-[#B58A55] mt-0.5" />
                  <div>
                    <p className="font-semibold">Bí quyết chuyên sâu:</p>
                    <p className="text-slate-600">
                      Hãy bấm quét <strong>Trợ lý Gemini</strong> trước để tự động tính toán decade gốc. Nhấn <strong>Chạy Phục Chế</strong> để xuất file dọn lỗi.
                    </p>
                  </div>
                </div>
              </div>

                    {!showAllSteps && activeStep === 3 && (
                      <div className="mt-8 pt-6 border-t border-dashed border-[#EAE3DE] flex justify-between items-center bg-[#FAF9F5] -mx-6 -mb-6 p-6">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-amber-700 hover:bg-[#FAF7F2] text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>← Chỉnh Sửa Thông Số</span>
                        </button>
                        <button
                          onClick={() => setActiveStep(4)}
                          className="px-5 py-2.5 bg-[#B58A55] border border-amber-950 hover:bg-slate-800 text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                        >
                          <span>Bước 4: Xem Kết Quả →</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          {/* RIGHT: INTERACTIVE PREVIEW WORKSPACE & COMPILER OUTPUT */}
          {!showAllSteps && (
            <>
              {activeStep === 2 && (
                <div className="lg:col-span-6 space-y-6 animate-[fadeIn_0.25s_ease-out]">
                  <div className="bg-[#FAF9F5] border border-[#EAE3DE] rounded-2xl shadow-sm p-6 overflow-hidden">
                    <span className="text-[10px] font-mono tracking-widest text-[#B58A55] font-bold uppercase block mb-1">
                      📁 Hồ sơ dữ liệu hình ảnh cũ
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 font-display mb-4">
                      Hình Ảnh Gốc Đang Hiệu Chỉnh Thông Số
                    </h3>

                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-[#EAE3DE] relative group shadow-inner">
                      <img
                        src={customImageBase64 || selectedPreset.vintageUrl}
                        alt="Vintage document"
                        referrerPolicy="no-referrer"
                        className="object-contain w-full h-full max-h-[380px] mx-auto"
                      />
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-[#FAF7F2] text-[10px] font-mono px-2 py-1 rounded-md border border-slate-700/50">
                        {selectedPresetId === "custom" ? "Tài liệu tùy chọn" : selectedPreset.year}
                      </div>
                    </div>

                    <div className="mt-5 space-y-3.5 border-t border-dashed border-[#EAE3DE] pt-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Tên Hồ Sơ:</span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {selectedPresetId === "custom" ? (customImageName || "Quay_Chup_Tu_Do.jpg") : selectedPreset.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Niên đại gốc gợi ý:</span>
                        <p className="text-xs font-semibold text-amber-900 mt-0.5 font-mono">
                          {restorationConfig.decade || "1950s"} (Xác định khảo cổ)
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Mẹo phục chế thiết thực:</span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Nhấn sang <strong>Bước 3: Chạy AI</strong> ở góc dưới bên trái để kích hoạt giải thuật khôi phục vật lý, làm nét mặt GFPGAN/CodeFormer và bù dải màu AI dã sử vẹn nguyên tinh hoa 8K UHD.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="lg:col-span-6 space-y-6 animate-[fadeIn_0.25s_ease-out]">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-5 text-slate-100 flex flex-col justify-between min-h-[420px] font-mono">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">RESTORATION_DAEMON_v4.0.0</span>
                        </div>
                        <span className="text-[9px] text-[#B58A55] font-bold">ONLINE</span>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <p className="text-slate-400"># Khởi tạo tiến trình khôi phục chi tiết ảnh cổ vật nghệ thuật...</p>
                        <p className="text-[#E2D2B5] font-bold">&gt; face_restore_intensity: {restorationConfig.faceRestoreIntensity}%</p>
                        <p className="text-[#E2D2B5] font-bold">&gt; colorization_mode: {restorationConfig.colorizationMode ? restorationConfig.colorizationMode.toUpperCase() : "VIVID"}</p>
                        <p className="text-[#E2D2B5] font-bold">&gt; eye_clarity: {restorationConfig.eyeClarity ? "TRUE" : "FALSE"} | hair_strands: {restorationConfig.hairStrands ? "TRUE" : "FALSE"}</p>
                        
                        {isProcessing && (
                          <div className="mt-6 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <p className="text-amber-400 animate-pulse font-bold">&gt;&gt; ĐANG XỬ LÝ KHÔI PHỤC DI SẢN...</p>
                            <p className="text-[10px] text-zinc-500 mt-1 leading-none">Vui lòng đón chờ kết quả so sánh ở Bước 4.</p>
                          </div>
                        )}
                        {!isProcessing && (
                          <div className="mt-6 p-4 border border-dashed border-slate-800 rounded-lg text-slate-400 text-[11px] leading-relaxed">
                            Bấm nút <strong>&quot;Chạy Phục Chế Chân Dung&quot;</strong> hoặc <strong>&quot;Dựng Video Màn Ảnh&quot;</strong> để truyền dữ liệu và biên dịch luồng lệnh. Tiến trình sẽ đưa bạn tự động sang Bước 4 để đón xem kết quả Trước/Sau trực quan sinh động.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 mt-4">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5">
                        <span>PIPELINE OVERALL COMPILING PROGRESS</span>
                        <span className="font-bold text-amber-500">{overallProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 transition-all duration-350" style={{ width: `${overallProgress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {(showAllSteps || activeStep === 4) && (
            <div className={`space-y-6 ${showAllSteps ? "lg:col-span-7" : "lg:col-span-12"}`}>
            
            {/* STAGE AND VIEWS SELECTION */}
            <div className="bg-white border border-[#EAE3DE] rounded-2xl shadow-sm p-6 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-3 border-b border-dashed border-slate-100 pb-2">
                <span className="text-[11px] tracking-wider font-mono text-[#B58A55] font-bold uppercase flex items-center gap-1">
                  ✨ Bước 4: So sánh thành phẩm & Kiểm thử trực quan
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-800 rounded-full animate-ping"></span>
                  <h3 className="font-display font-semibold text-slate-900 text-sm">
                    Kính Kính Soi & Bàn Phục Bản Hiện Vật Việt Nam
                  </h3>
                </div>

                {/* Switch Workspace viewing modes */}
                <div className="flex bg-slate-100 hover:bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setOutputView("comparison")}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      outputView === "comparison"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Thước kéo so sánh</span>
                  </button>

                  <button
                    onClick={() => setOutputView("video_simulation")}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      outputView === "video_simulation"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Hoạt họa chuyển động</span>
                  </button>
                </div>
              </div>

              {/* SCREEN STAGE CONTAINER (RELATIVE CANVASES) */}
              <div
                ref={comparisonContainerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative aspect-square w-full rounded-xl bg-slate-900 overflow-hidden select-none border border-slate-800"
              >
                {/* 1. VIEW A: DUAL SLIDER HORIZONTAL COMPARISON MODE */}
                {outputView === "comparison" ? (
                  <div className="absolute inset-0 w-full h-full cursor-ew-resize">
                    {/* RESTORED BACKGROUND LAYER */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={replicateRestoredUrl || (selectedPresetId === "custom" && customImageBase64 ? customImageBase64 : selectedPreset.restoredUrl)}
                        alt="Restored Colorized"
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full w-full h-full pointer-events-none"
                        style={{
                          filter: (selectedPresetId === "custom" && !replicateRestoredUrl) 
                            ? `contrast(1.1) brightness(1.02) saturate(${restorationConfig.colorizationMode === "vivid" ? 1.25 : restorationConfig.colorizationMode === "mild" ? 0.9 : 0})`
                            : "none"
                        }}
                      />
                      {/* Label Restored */}
                      <span className="absolute bottom-4 right-4 bg-emerald-950/80 backdrop-blur-md text-[#F5EFE6] px-2.5 py-1 rounded-lg text-[10px] font-mono border border-emerald-800">
                        ⚡ AI Bản Phục Chế
                      </span>
                    </div>

                    {/* VINTAGE DAMAGED OVERLAY (CLIPPED BY SLIDER PERCENTAGE) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={selectedPresetId === "custom" && customImageBase64 ? customImageBase64 : selectedPreset.vintageUrl}
                        alt="Vintage Damaged"
                        referrerPolicy="no-referrer"
                        className="object-cover h-full pointer-events-none"
                        style={{ 
                          width: comparisonContainerRef.current?.offsetWidth || 500,
                          maxWidth: "none",
                          filter: selectedPresetId === "custom" ? "sepia(0.65) contrast(0.85) grayscale(1) blur(0.5px)" : "none"
                        }}
                      />
                      {/* Label Vintage */}
                      <span className="absolute bottom-4 left-4 bg-amber-950/85 backdrop-blur-md text-[#FAF7F2] px-2.5 py-1 rounded-lg text-[10px] font-mono border border-amber-900">
                        📻 Bản Gốc [{restorationConfig.decade}]
                      </span>
                    </div>

                    {/* CENTRAL DRAGGABLE HANDLE LINE */}
                    <div
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleMouseDown}
                      className="absolute inset-y-0 z-30 w-1 bg-amber-600 cursor-ew-resize flex items-center justify-center pointer-events-auto"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute w-8 h-8 rounded-full bg-[#FAF7F2] shadow-xl border border-amber-700/60 flex items-center justify-center text-amber-950 hover:bg-white active:scale-95 transition-all text-xs font-bold select-none">
                        ↔️
                      </div>
                    </div>
                  </div>
                ) : (
                  
                  // 2. VIEW B: VIDEO ANIMATED MOTION CANVAS SIMULATION (Part 2 positive properties)
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
                    
                    {/* Ambient drift clouds & light ray layer */}
                    <div className="absolute inset-0 bg-transparent overflow-hidden pointer-events-none z-10">
                      
                      {/* Ghibli Dust / Light star particles */}
                      {videoConfig.environment === "cinematic_lighting" && (
                        <>
                          <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-amber-300/40 mix-blend-color-dodge blur-[1px] animate-drift"></div>
                          <div className="absolute top-[60%] left-[10%] w-3 h-3 rounded-full bg-amber-200/50 mix-blend-screen blur-[2px] animate-drift" style={{ animationDelay: "3s" }}></div>
                          <div className="absolute top-[40%] left-[80%] w-1.5 h-1.5 rounded-full bg-amber-300/60 blur-[0.5px] animate-drift" style={{ animationDelay: "6s" }}></div>
                          
                          {/* Sunkissed Ray overlay effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-600/5 to-amber-500/10 mix-blend-screen pointer-events-none"></div>
                        </>
                      )}

                      {/* Studio Wind petals layer */}
                      {videoConfig.environment === "windy" && (
                        <>
                          <div className="absolute top-[10%] left-[-10%] w-4 h-2 bg-pink-100/30 rounded-full blur-[1px] transform rotate-12 animate-drift" style={{ animationDirection: "normal", animationDuration: "8s" }}></div>
                          <div className="absolute top-[70%] left-[-5%] w-3 h-1.5 bg-emerald-200/20 rounded-full blur-[1px] transform -rotate-12 animate-drift" style={{ animationDelay: "4s", animationDuration: "10s" }}></div>
                        </>
                      )}
                    </div>

                    {/* DYNAMIC ANIME ZOOM/PAN EFFECT IN GRAPHIC VIEWPORT */}
                    <motion.div
                      animate={{
                        scale: videoConfig.camera === "zoom_in" ? [1, 1.05, 1.01, 1.05] : 1,
                        x: videoConfig.camera === "pan_left_right" ? [-10, 10, -5, 10] : 0,
                        rotate: videoConfig.camera === "zoom_in" ? [0, 0.5, -0.2, 0.5] : 0,
                      }}
                      transition={{
                        duration: 16,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                      className="w-full h-full absolute inset-0 origin-center"
                    >
                      <img
                        src={replicateRestoredUrl || (selectedPresetId === "custom" && customImageBase64 ? customImageBase64 : selectedPreset.restoredUrl)}
                        alt="Video Simulation Restored Output"
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full"
                        style={{
                          filter: videoConfig.style === "anime_2d"
                            ? "contrast(1.05) saturate(1.1) brightness(1.02)"
                            : "contrast(1.12) saturate(1.15) brightness(1.04)",
                        }}
                      />

                      {/* Ghibli sway overlay / Breathe effects */}
                      <div className="absolute inset-0 bg-black/10 mix-blend-multiply opacity-15"></div>
                    </motion.div>

                    {/* EYE BLINK AND BREATH SHIFT LOOP OVERLAY */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="text-white text-center drop-shadow-lg z-20">
                        {videoConfig.action === "blink_and_smile" && (
                          <div className="flex flex-col items-center gap-1 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider border border-slate-700">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                            <span>Mô phỏng Ghibli Blinking & Smile...</span>
                          </div>
                        )}
                        {videoConfig.action === "wave_hand" && (
                          <div className="flex flex-col items-center gap-1 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider border border-slate-700">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            <span>Mô phỏng Pixar 3D Waving gesture...</span>
                          </div>
                        )}
                        {videoConfig.action === "talking" && (
                          <div className="flex flex-col items-center gap-1 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider border border-slate-700">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <span>Công nghệ AI Lip-Sync lồng tiếng...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HUD Label for Video */}
                    <span className="absolute top-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md text-[#E2D2B5] px-2.5 py-1 rounded-lg text-[9px] font-mono border border-[#C8B184]/40 uppercase tracking-widest font-bold">
                      📸 {videoConfig.style.toUpperCase()} RENDER WORKSPACE
                    </span>

                    {/* Interactive music watermark if on */}
                    {isVinylPlaying && (
                      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 text-amber-200 text-[10px] px-2 py-1 rounded flex items-center gap-1.5 font-mono animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        <span>Đĩa hát Đang phát (Ambient Vinyl)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* RUNNING PROCESSING BACKEND SIMULATION LAYER */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-6 z-40"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 animate-spin flex items-center justify-center mb-6">
                        <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                      </div>

                      <h4 className="text-[#FAF7F2] font-display font-semibold tracking-wide text-sm mb-1 uppercase">
                        AI Model Pipeline Đang Biên Dịch
                      </h4>
                      <p className="text-[10px] text-amber-500 font-mono mb-4 uppercase tracking-widest font-bold">
                        Hệ Thống Phục Bản hình ảnh Quốc Gia
                      </p>

                      {/* Progress bar */}
                      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-8">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${overallProgress}%` }}
                          className="h-full bg-gradient-to-r from-amber-600 to-indigo-500 rounded-full"
                        ></motion.div>
                      </div>

                      {/* Steps Console lines */}
                      <div className="w-full max-w-sm font-mono text-left bg-slate-900 border border-slate-800 p-4 rounded-xl text-[11px] h-36 overflow-y-auto space-y-1.5">
                        {progressSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 ${
                              step.status === "completed" ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            <span className="shrink-0">{step.status === "completed" ? "✓" : "⚡"}</span>
                            <span className="leading-relaxed">{step.message}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DYNAMIC METADATA INFORMATION DISPLAY (Gemini API results output) */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-[#EAE3DE] flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#B58A55] font-bold uppercase">
                      🔎 Chẩn Đoán Cổ Vật AI
                    </span>
                    {isAnalyzing && <span className="text-[9px] text-amber-800 animate-pulse font-mono font-bold">Quét màng mạng...</span>}
                  </div>
                  
                  {geminiAnalysis ? (
                    <div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        &quot;{geminiAnalysis.analysisText}&quot;
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="bg-amber-950 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md">
                          Thập kỷ khuyên dùng: {geminiAnalysis.suggestedDecade}
                        </span>
                        
                        {geminiAnalysis.suggestedColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 text-amber-950 font-medium text-[9px] font-mono px-2 py-0.5 rounded-md border border-amber-200/60"
                          >
                            🎨 {col}
                          </span>
                        ))}

                        {geminiAnalysis.suggestedRepairTags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[9px] font-mono px-2 py-0.5 rounded-md"
                          >
                            ⚠️ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      Chưa tiến hành phân tính di bản hình học. Bấm nút <strong>&quot;Trợ lý Gemini quét hình ảnh&quot;</strong> để kích hoạt nhận diện lịch sử tự động.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* NEXT BUTTON FOR STEP 4 IN STEP-BY-STEP MODE */}
            {!showAllSteps && (
              <div className="bg-white border border-[#EAE3DE] rounded-2xl p-5 mt-4 flex justify-between items-center shadow-sm">
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 border border-slate-200 hover:border-amber-800 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>← Quay lại Bước 3: Chạy AI</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStep(5);
                  }}
                  className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                >
                  <span>Mở Bước 5: Xem API Payload & Prompts →</span>
                  <Layers className="w-3.5 h-3.5 text-amber-200" />
                </button>
              </div>
            )}

          </div>
          )}
        </section>
        )}

        {/* BƯỚC 5: PROMPTS GENERATOR & AUTOMATION JSON DATA-SHEET */}
        {(showAllSteps || activeStep === 5) && (
          <section className="bg-white border border-[#EAE3DE] rounded-2xl shadow-sm p-6 mt-8" id="step-5-section">
          <div className="border-b border-[#EAE3DE] pb-4 mb-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#B58A55] font-semibold flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> Bước 5: Trình Biên Dịch Chuỗi Lệnh Prompts & Thiết Lập Cấu Trúc Dữ Liệu Tự Động Hóa API
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Bản vẽ thiết kế hệ thống dữ liệu tự động đồng bộ hóa thời gian thực. Cơ chế trích xuất dữ liệu tự động chuẩn hóa dựa trên các thông số cấu hình đồ họa phía trên để kết xuất trực tiếp lên API.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* COLUMN 1: INTERACTIVE PROMPT CODES (5 columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-[#FAF9F5] border border-[#EAE3DE] rounded-xl">
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#EAE3DE]">
                  <Sparkles className="w-4 h-4 text-amber-700 font-bold" />
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wide">
                    Chuỗi Lệnh Tối Ưu Phục Chế (Positive Prompt)
                  </h4>
                </div>
                
                <div className="space-y-4">
                  {/* Positive prompt box */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-800 uppercase">
                        Positive Prompt (Gửi lên API)
                      </span>
                      <button
                        onClick={() => handleCopyText(generatePositivePrompt(), setCopiedPositive)}
                        className="text-xs hover:text-[#B58A55] text-slate-600 font-medium flex items-center gap-1 cursor-pointer"
                        title="Sao chép Prompt"
                      >
                        {copiedPositive ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPositive ? "Đã chép!" : "Sao chép"}</span>
                      </button>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono leading-relaxed h-32 overflow-y-auto whitespace-pre-wrap select-all text-slate-700 shadow-inner">
                      {generatePositivePrompt()}
                    </div>
                  </div>

                  {/* Negative prompt box */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono tracking-wider font-bold text-red-800 uppercase">
                        Negative Prompt (Chặn biến dạng ảnh)
                      </span>
                      <button
                        onClick={() => handleCopyText(generateNegativePrompt(), setCopiedNegative)}
                        className="text-xs hover:text-[#B58A55] text-slate-600 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {copiedNegative ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNegative ? "Đã chép!" : "Sao chép"}</span>
                      </button>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono leading-relaxed h-16 overflow-y-auto select-all text-slate-700 shadow-inner">
                      {generateNegativePrompt()}
                    </div>
                  </div>

                  {/* Vietnamese explanation */}
                  <div className="p-3 bg-[#FAF7F2] border border-amber-200/50 rounded-lg">
                    <span className="text-[9px] font-semibold text-amber-800 font-mono tracking-wider block mb-1 uppercase">
                      📖 Bản dịch diễn giải ý nghĩa (Tiếng Việt)
                    </span>
                    <p className="text-slate-700 text-xs leading-relaxed italic">
                      {getVietnameseEquivalent()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: JSON INTEGRATION SPECIFICATION (7 columns) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Cấu trúc JSON đầu ra Automation
                    </h4>
                  </div>
                  
                  <button
                    onClick={() => handleCopyText(getCompiledJSON(), setCopiedJSON)}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[#E2D2B5] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJSON ? "Đã chép!" : "Sao chép JSON"}</span>
                  </button>
                </div>

                <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-900 max-h-[285px] overflow-y-auto overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{getCompiledJSON()}</pre>
                </div>
              </div>
            </div>

            {/* NEXT BUTTON FOR STEP 5 IN STEP-BY-STEP MODE */}
            {!showAllSteps && (
              <div className="border-t border-dashed border-[#EAE3DE] pt-5 mt-6 flex justify-between items-center bg-[#FAF9F5] -mx-6 -mb-6 p-6">
                <button
                  onClick={() => {
                    setActiveStep(4);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-amber-700 hover:bg-[#FAF7F2] text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>← Quay lại Bước 4</span>
                </button>
                <button
                  onClick={() => {
                    setShowStep6(true);
                    setActiveStep(6);
                  }}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-950 hover:bg-[#slate-800] text-[#FAF7F2] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                >
                  <span>Triển khai Node.js (Bước 6) →</span>
                  <Info className="w-3.5 h-3.5 text-amber-200" />
                </button>
              </div>
            )}

          </div>
        </section>
        )}
      </>
    )}

        {/* BƯỚC 6: BACKEND INTEGRATION IMPLEMENTATION MANUAL */}
        {((!showAllSteps && activeStep === 6) || (showAllSteps && showStep6)) && (
          <section className="bg-white border border-[#EAE3DE] rounded-2xl shadow-sm p-6 mt-8" id="step-6-section">
          <div className="border-b border-[#EAE3DE] pb-4 mb-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#B58A55] font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Bước 6: Hướng Dẫn Kỹ Thuật Tích Hợp và Triển Khai Node.js Backend
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Đặc tả quy trình cài đặt và đồng bộ hóa thư viện RESTful API tại máy chủ Backend ứng dụng Node.js/Express.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Quick installation library block */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-[#FAF7F2] border border-amber-200/50 rounded-xl space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-amber-800 font-bold uppercase block">
                  1. Khởi tạo & nạp thư viện
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Để chạy quy trình phục chế ảnh cũ nâng cao tự động bằng hệ sinh thái máy chủ Node.js độc lập, cài đặt thư viện SDK chính thức từ Replicate:
                </p>
                <div className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span>npm install replicate</span>
                  <button
                    onClick={() => handleCopyText("npm install replicate", setCopiedCode)}
                    className="text-slate-400 hover:text-emerald-300 font-semibold cursor-pointer text-xs"
                  >
                    {copiedCode ? "Đã Chép!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* API endpoints suggestion & routing block */}
            <div className="lg:col-span-7 space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-mono tracking-widest text-indigo-800 font-bold uppercase block">
                2. Khai báo liên cung cấp & Địa chỉ API kiến nghị
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Máy chủ Node.js của bạn có nhiệm vụ chuyển giao payload của Bước 5 lên các dịch vụ điện toán đám mây GPU chuyên dụng:
              </p>
              <div className="pt-2 space-y-2 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="font-semibold text-slate-800 block mb-1">🖥️ Phục chế khuôn mặt (GFPGAN):</span>
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-[#B58A55] text-[10px] block truncate text-center mt-1">
                      tencentarc/gfpgan
                    </code>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EAE3DE] rounded-lg bg-[#FAF9F5]">
                    <span className="font-semibold text-slate-800 block mb-1">🎨 Mỹ thuật hoạt cảnh 3D/Ghibli:</span>
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-[#B58A55] text-[10px] block truncate text-center mt-1">
                      fal-ai/kling-video
                    </code>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed italic mt-2.5">
                  🛡️ Lập trình viên nhận ngay 1,000 requests miễn phí phục chế khi kiến tạo tài khoản thử nghiệm trên Replicate / Fal.ai chính thống.
                </p>
              </div>
            </div>
          </div>

          {!showAllSteps && (
            <div className="border-t border-dashed border-[#EAE3DE] pt-5 mt-6 flex justify-start">
              <button
                onClick={() => setActiveStep(5)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-amber-800 hover:bg-[#FAF7F2] text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>← Quay lại bệ phóng Bước 5</span>
              </button>
            </div>
          )}
        </section>
      )}
          </>
        )}

        {appView === "restore" && (
          <ImageRestorer />
        )}

        {appView === "collection" && (
          <MyCollectionPage />
        )}

        {appView === "statistics" && (
          <StatisticsPage />
        )}

        {appView === "bookmark_detail" && (() => {
          const b = bookmarks.find((bk) => bk.id === selectedBookmarkId);
          return b ? <BookmarkDetail bookmark={b} /> : null;
        })()}

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
        <p>© 2026 Photo video studio v3.1 - Phát triển bởi Nguyễn Viết Diệu</p>
      </footer>

      {/* 5. Giao diện Chập Ảnh / Quay Phim từ Camera thời gian thực (Phần 4) */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 [backdrop-filter:blur(10px)] z-50 flex justify-center items-start md:items-center p-2 sm:p-4 overflow-y-auto pt-8 pb-16"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-4 md:my-auto"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSimulatedStream ? "bg-amber-500 animate-pulse" : "bg-red-500 animate-pulse"}`}></div>
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase truncate max-w-[150px] sm:max-w-none">
                    {isSimulatedStream ? "📷 Camera Giả Lập" : "🎥 Camera Thật v2.0"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 px-2 rounded-lg bg-amber-950 border border-amber-800/80 text-amber-300 hover:text-white hover:bg-amber-900 transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Mở ứng dụng ở tab mới để phóng to bự và dùng camera thật không bị chặn"
                  >
                    <Maximize2 className="w-3 h-3 text-amber-400" />
                    <span>Phóng To</span>
                  </a>
                  <button
                    onClick={stopCamera}
                    className="p-1 px-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-750"
                  >
                    <X className="w-3 h-3 text-rose-400" />
                    <span>Đóng</span>
                  </button>
                </div>
              </div>

              {/* Secure Context Explanation Alert banner is shown when error occurs or simulated stream is active */}
              {(isSimulatedStream || hasCameraError) && (
                <div className="bg-[#1C1815] p-3.5 border-b border-amber-900/30 text-xs text-left leading-relaxed space-y-2.5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <CameraOff className="w-4 h-4 shrink-0 text-red-500 animate-pulse text-amber-500" />
                    <span>⚠️ KHẮC PHỤC BIỂU TƯỢNG CAMERA BỊ KHÓA / CÓ GẠCH CHÉO</span>
                  </div>
                  
                  <div className="text-slate-300 text-[11px] space-y-2">
                    <p>
                      Khi trình duyệt hiển thị <strong>biểu tượng camera bị khóa (có dấu gạch ngang)</strong> trên thanh địa chỉ hoặc màn hình tối đen chặn truy cập:
                    </p>
                    <ul className="list-decimal list-inside space-y-1.5 pl-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-slate-300">
                      <li>
                        <span className="font-semibold text-amber-400">Cách 1 (Khuyên dùng):</span> Nhấn nút <span className="font-semibold text-white underline">"Open in new tab"</span> (Mở tab mới) ở <span className="text-amber-300 font-semibold text-xs">góc trên cùng bên phải</span> của giao diện AI Studio để chạy app độc lập, giúp vượt qua cơ chế chặn camera của hệ thống Sandbox Iframe.
                      </li>
                      <li>
                        <span className="font-semibold text-amber-400">Cách 2:</span> Click trực tiếp vào biểu tượng camera bị gạch chéo màu đỏ trên <span className="font-semibold text-white">Thanh Địa Chỉ Trình Duyệt</span>, chọn <span className="text-emerald-400 font-semibold">"Luôn cho phép" (Always Allow)</span> và tải lại trang.
                      </li>
                      <li>
                        <span className="font-semibold text-amber-400">Cách 3:</span> Bấm nút <span className="text-emerald-400 font-semibold">"DÙNG GIẢ LẬP"</span> màu đỏ bên dưới để chụp ảnh, quay video tài liệu giả lập di sản sắc nét tức thì mà không cần cấp quyền!
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Mode Switcher */}
              <div className="p-3 bg-slate-950/40 flex border-b border-slate-800/60">
                <div className="flex bg-slate-100/10 p-0.5 rounded-xl w-full">
                  <button
                    onClick={() => { setCameraMode("photo"); startCamera(facingMode); }}
                    className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                      cameraMode === "photo"
                        ? "bg-amber-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    📸 Chụp Ảnh Cổ Điển
                  </button>
                  <button
                    onClick={() => { setCameraMode("video"); startCamera(facingMode); }}
                    className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                      cameraMode === "video"
                        ? "bg-indigo-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🎥 Quay Video Phục Chế (10s)
                  </button>
                </div>
              </div>

              {/* Viewport Stage (relative grid viewport) */}
              <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
                
                {isSimulatedStream ? (
                  /* Beautiful Animated Retro Viewfinder for Simulated Mode */
                  <div className="w-full h-full bg-gradient-to-br from-[#1c1815] via-[#2D2620] to-[#141210] flex flex-col items-center justify-center relative p-6">
                    {/* Retro Grid noise lines moving upwards */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none" />
                    
                    {/* Simulated Camera lens circles */}
                    <div className="w-64 h-64 rounded-full border-2 border-[#b58a55]/20 flex items-center justify-center relative animate-[spin_40s_linear_infinite]">
                      <div className="w-48 h-48 rounded-full border border-dashed border-[#b58a55]/30 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-4 border-double border-[#b58a55]/40 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-amber-500/60 animate-ping"></div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 space-y-2 z-10">
                      <p className="text-amber-500 font-mono text-[11px] uppercase tracking-widest animate-pulse font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
                        • LIVE SIM FEED ACTIVE •
                      </p>
                      <h4 className="text-slate-200 font-bold text-center text-sm font-sans tracking-tight">
                        {cameraMode === "photo" ? "Mục Tiêu: Ảnh hình ảnh Phố Cổ" : "Mục Tiêu: Thước Phim Đời Sống"}
                      </h4>
                      <p className="text-[10px] text-slate-400 text-center max-w-[280px]">
                        Hệ thống đã nhận tín hiệu và chuẩn hóa cấu trúc mỹ thuật quang học. Nhấn nút để bắt giữ ảnh cũ.
                      </p>
                    </div>

                    {/* Animated vertical scanning line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-[bounce_5s_infinite]" />
                  </div>
                ) : cameraStream ? (
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`object-cover w-full h-full ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                    <p className="text-xs font-mono">Đang khởi tạo luồng camera...</p>
                  </div>
                )}

                {/* Viewfinder Graphic Overlay */}
                <div className="absolute inset-4 border border-white/10 pointer-events-none flex flex-col justify-between p-4 z-10">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
                    <div className="w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
                  </div>
                  
                  {/* Central Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-6 h-0.5 bg-white"></div>
                    <div className="h-6 w-0.5 bg-white absolute"></div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>
                  </div>
                </div>

                {/* Live recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 bg-red-950/80 backdrop-blur-md text-red-100 border border-red-500 text-[10px] font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5 z-20 animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    <span>ĐANG GHI HÌNH: {recordingSeconds}s / 10s</span>
                  </div>
                )}

                {/* Simulated metadata watermark */}
                <span className="absolute bottom-4 left-4 bg-slate-950/65 text-slate-300 text-[9px] font-mono py-1 px-2 rounded backdrop-blur-md z-10">
                  {isSimulatedStream ? "SIMULATOR" : facingMode === "user" ? "FRONT" : "REAR"} CAM • ISO AUTO • 24FPS
                </span>
                
                <span className="absolute bottom-4 right-4 bg-slate-950/65 text-slate-300 text-[9px] font-mono py-1 px-2 rounded backdrop-blur-md z-10">
                  System 2026 UTC
                </span>
              </div>

              {/* Controls Section */}
              <div className="p-6 bg-slate-950 flex flex-col items-center gap-4">
                {/* Captured or Recorded visual loops */}
                {recordedVideoUrl && (
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-black shrink-0 relative border border-slate-700">
                      <video src={recordedVideoUrl} autoPlay loop muted playsInline className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] font-bold text-slate-200">Đã quay xong Clip Video!</p>
                      <p className="text-[9px] text-[#B58A55] font-mono mt-0.5">
                        Kích thước: {recordedVideoBlob ? (recordedVideoBlob.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                      </p>
                      <span className="text-[9px] text-[#b58a55] block mt-0.5 leading-tight">
                        (Khung bìa đã được tự động nạp làm ảnh phục chế và sinh prompt video)
                      </span>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="flex items-center gap-6 w-full justify-center">
                  {/* Toggle Front/Back Camera */}
                  <button
                    onClick={toggleFacingMode}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all cursor-pointer shadow"
                    title="Đổi camera trước/sau"
                    disabled={isSimulatedStream}
                  >
                    <RotateCw className={`w-5 h-5 ${isSimulatedStream ? "opacity-30" : ""}`} />
                  </button>

                  {cameraMode === "photo" ? (
                    <button
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center border-4 border-amber-950 shadow-lg active:scale-95 transition-all cursor-pointer font-bold"
                      title="Chụp ảnh ngay lập tức"
                    >
                      <Camera className="w-6 h-6 text-slate-950" />
                    </button>
                  ) : (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer border-4 ${
                        isRecording 
                          ? "bg-red-600 hover:bg-red-700 border-red-950 animate-pulse text-white" 
                          : "bg-indigo-600 hover:bg-indigo-505 border-indigo-950 text-white"
                      }`}
                    >
                      {isRecording ? <StopCircle className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                    </button>
                  )}

                   {/* Secondary Switch simulator mode toggle with clearer text-and-icon choices */}
                  <button
                    onClick={() => {
                      const nextState = !isSimulatedStream;
                      setIsSimulatedStream(nextState);
                      if (nextState) {
                        if (cameraStream) {
                          cameraStream.getTracks().forEach(track => track.stop());
                          setCameraStream(null);
                        }
                      } else {
                        startCamera(facingMode);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl transition-all cursor-pointer shadow text-[10px] uppercase font-bold flex items-center gap-1.5 ${
                      isSimulatedStream 
                        ? "bg-rose-950/80 border border-rose-800 text-rose-200 hover:bg-rose-900" 
                        : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750"
                    }`}
                    title="Chuyển đổi giữa chế độ camera thật và camera giả lập di sản"
                  >
                    {isSimulatedStream ? (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Dùng Thiết Bị Thật</span>
                      </>
                    ) : (
                      <>
                        <CameraOff className="w-3.5 h-3.5" />
                        <span>Kích Hoạt Giả Lập</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 tracking-wide text-center">
                  Nhấn nút tròn lớn màu để {cameraMode === "photo" ? "Chụp ảnh ảnh cũ tức thì" : isRecording ? "Dừng ghi hình" : "Bắt đầu ghi hình điện ảnh 10s"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 6. Giao diện Hướng Dẫn Sử Dụng Chi Tiết (Bản dịch Việt ngữ học thuật) */}
        {/* Dynamic Theme Customizer Modal */}
        {isThemeSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 [backdrop-filter:blur(6px)] z-50 flex justify-center items-start md:items-center p-2 sm:p-4 overflow-y-auto pt-8 pb-16"
            onClick={() => setIsThemeSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-4 md:my-auto text-slate-800 dark:text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm font-bold tracking-wide text-slate-900 dark:text-white uppercase font-display">
                      Tùy Chọn Cá Nhân Hóa Giao Diện
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                      Cá nhân hóa bảng màu chủ đạo, font chữ và mật độ không gian hiển thị
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsThemeSettingsOpen(false)}
                  className="p-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Đóng</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[75vh]">
                <ThemeCustomizer />
              </div>
            </motion.div>
          </motion.div>
        )}

        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 [backdrop-filter:blur(10px)] z-50 flex justify-center items-start md:items-center p-2 sm:p-4 overflow-y-auto pt-8 pb-16"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-4 md:my-auto text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 bg-amber-950/90 border-b border-amber-900/60 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-300 animate-bounce" />
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase font-display">
                      Cẩm Nang Hướng Dẫn Phục Dựng hình ảnh
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-amber-200/80 font-mono">
                     Photo video studio v3.1
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-800"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Đóng</span>
                </button>
              </div>

              {/* Modal Body with Scrollable Area */}
              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-sm text-slate-300 leading-relaxed text-left">
                
                {/* Section 1: Intro */}
                <div className="p-4 bg-[#1e1a17] rounded-2xl border border-amber-900/20">
                  <p className="text-xs text-amber-200/90 italic">
                    Chào mừng bạn đến với **Phòng Phục Dựng Bảo Tồn Tư Liệu**. Ứng dụng tích hợp các mô hình thông minh tiên tiến nhất giúp bạn dọn dẹp các khuyết tật của giấy ảnh cổ xưa, phục chế nụ cười chân dung sắc sảo và hóa thân thành vòm chuyển động điện ảnh kỳ ảo.
                  </p>
                </div>

                {/* Section 2: Step-by-Step */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold border-b border-slate-800 pb-1.5 flex items-center gap-2">
                    <span>🗺️</span> 5 Bước Làm Việc Chuẩn Khảo Cổ Số
                  </h4>
                  
                  <div className="space-y-4">
                    {/* step 1 */}
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-900 border border-amber-700 text-amber-200 flex items-center justify-center font-mono text-xs shrink-0 font-bold mt-0.5">
                        1
                      </span>
                      <div>
                        <p className="font-bold text-slate-100 text-[13px]">Chọn hoặc Tải Nhập hình ảnh</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Chọn nhanh từ 3 preset mẫu lịch sử của Việt Nam qua các thập niên, hoặc tự tải tệp ảnh gốc. Bạn cũng có thể mở <strong>Camera vật lý thiết bị</strong> để chụp ảnh tư liệu/ảnh cũ ngay trước mặt.
                        </p>
                      </div>
                    </div>

                    {/* step 2 */}
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-900 border border-amber-700 text-amber-200 flex items-center justify-center font-mono text-xs shrink-0 font-bold mt-0.5">
                        2
                      </span>
                      <div>
                        <p className="font-bold text-slate-100 text-[13px]">Hiệu Chỉnh Thông Số Phục Dựng</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tích chọn các tùy chọn sửa lỗi vật lý: <strong>khử sờn rách</strong> nếp gập gãy, <strong>khử trầy xước/ố mốc ẩm</strong>, và tinh hoa nhất là kích hoạt <strong>Phục chế nét khuôn mặt (AI Face Enhancer)</strong> giúp chân dung mờ trở nên sắc nét vượt trội.
                        </p>
                      </div>
                    </div>

                    {/* step 3 */}
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-900 border border-amber-700 text-amber-200 flex items-center justify-center font-mono text-xs shrink-0 font-bold mt-0.5">
                        3
                      </span>
                      <div>
                        <p className="font-bold text-slate-100 text-[13px]">Quét Hình Ảnh Bằng Trợ Lý Gemini AI</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Nhấn <strong>"Trợ lý Gemini quét hình ảnh"</strong> để AI nhận diện niên đại phỏng đoán cổ vật, gợi ý dải màu phục hồi, bóc tách các khuyết tật sờn cũ và tự động điều chỉnh dải thanh trượt tối ưu của phần mềm.
                        </p>
                      </div>
                    </div>

                    {/* step 4 */}
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-900 border border-amber-700 text-amber-200 flex items-center justify-center font-mono text-xs shrink-0 font-bold mt-0.5">
                        4
                      </span>
                      <div>
                        <p className="font-bold text-slate-100 text-[13px]">Tạo Hoạt Ảnh Clip Sống Động</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ở mục hoạt cảnh phim (Image-to-Video), đổi sang phong cách <strong>Anime 2D lãng mạn</strong> hoặc <strong>3D tinh mịn</strong>, gán chuyển động góc máy (Zoom ghé / Pan liếc) kèm luồng bối cảnh (Gió thổi bay bồng bềnh tự nhiên, hay ánh nắng và hạt bụi rêu trôi lơ lửng) để bức tranh sống dậy ngoạn mục.
                        </p>
                      </div>
                    </div>

                    {/* step 5 */}
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-900 border border-amber-700 text-amber-200 flex items-center justify-center font-mono text-xs shrink-0 font-bold mt-0.5">
                        5
                      </span>
                      <div>
                        <p className="font-bold text-slate-100 text-[13px]">Kéo Trượt & Xuất Thành Phẩm</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sử dụng thanh trượt phân tách (Split Slider) tại trung tâm màn hình để so sánh trực quan từng thớ giấy phục hồi xưa & nay. Tải ảnh hoặc thước phim hoạt họa điện ảnh về máy tính dễ dàng.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Camera & IFrame hints */}
                <div className="p-4 bg-amber-950/30 border border-amber-900/40 rounded-2xl text-xs space-y-2.5 text-left">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
                    <CameraOff className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                    <span>💡 GIẢI ĐÁP CAMERA BỊ KHÓA / ĐEN MÀN HÌNH</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Hệ thống chạy trên cơ chế <strong>Iframe Sandbox</strong> có độ bảo mật cao, do đó một số trình duyệt của bạn có thể tạm thời chặn quyền truy cập Camera thật. Để mở khóa cực đơn giản:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1.5 text-slate-300 text-[11px]">
                    <li>
                      Hãy click nút <span className="font-semibold text-amber-300 underline">"Open in new tab"</span> ở góc trên cùng bên phải màn hình để tách ứng dụng chạy riêng biệt không lo bị chặn quyền.
                    </li>
                    <li>
                      Hoặc nhấn nút chuyển sang chế độ <span className="text-rose-400 font-bold">"DÙNG GIẢ LẬP"</span> để trải nghiệm chụp mây cổ, quay ảnh tài liệu giả lập di sản sắc nét tức thì mà không cần cài đặt phức tạp!
                    </li>
                  </ul>
                </div>

                {/* Section 4: Gemini limit questions */}
                <div className="p-4 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl text-xs space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>⚙️ CƠ CHẾ KẾT NỐI GEMINI AI & DUNG LƯỢNG GIỚI HẠN?</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    - <strong>Kết nối API:</strong> Khi hệ thống nằm trong khu vực mạng bị nghẽn hoặc chính sách CORS sandbox hạn chế, chương trình sẽ thông minh chuyển hướng tự động sang <strong>Phân tích di sản cục bộ (Offline Mode Fallback)</strong> mà không làm gián đoạn trải nghiệm người dùng.
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    - <strong>Giới hạn dung lượng:</strong> Hệ thống tối ưu hóa và nén hình ảnh tự động trước khi phân tích nhằm tiết kiệm tối đa băng thông. Bạn có thể nạp tệp dung lượng lớn mà không sợ tràn giới hạn tải.
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>Heritage AI Restorer Lab 2026</span>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-[#F5EFE6] font-semibold tracking-wide transition-all cursor-pointer border border-amber-950 shadow"
                >
                  Bắt Đầu Phục Chế
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

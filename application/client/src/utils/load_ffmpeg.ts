import { FFmpeg } from "@ffmpeg/ffmpeg";

export async function loadFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();
  const [{ default: coreURL }, { default: wasmURL }] = await Promise.all([
    import("@ffmpeg/core?url"),
    import("@ffmpeg/core/wasm?url"),
  ]);

  await ffmpeg.load({
    coreURL,
    wasmURL,
  });

  return ffmpeg;
}

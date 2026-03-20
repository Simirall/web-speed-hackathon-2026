import { loadFFmpeg } from "@web-speed-hackathon-2026/client/src/utils/load_ffmpeg";

interface Options {
  extension: string;
  size?: number | undefined;
}

/**
 * 先頭 5 秒のみ、正方形にくり抜かれた無音動画を作成します
 */
export async function convertMovie(file: File, options: Options): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  const videoFilters = [
    "crop='min(iw,ih)':'min(iw,ih)'",
    options.size ? `scale=${options.size}:${options.size}` : undefined,
    "fps=10",
  ]
    .filter(Boolean)
    .join(",");
  const exportFile = `export.${options.extension}`;

  await ffmpeg.writeFile("file", new Uint8Array(await file.arrayBuffer()));

  await ffmpeg.exec([
    "-i",
    "file",
    "-t",
    "5",
    "-vf",
    videoFilters,
    "-an",
    "-c:v",
    "libvpx",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "36",
    "-b:v",
    "0",
    exportFile,
  ]);

  const output = (await ffmpeg.readFile(exportFile)) as Uint8Array<ArrayBuffer>;

  ffmpeg.terminate();

  return new Blob([output.buffer], { type: `video/${options.extension}` });
}

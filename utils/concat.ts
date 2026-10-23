export function buildConcatArgs(fileNames: string[], aspectRatio: '9:16' | '16:9', withAudio: boolean): string[] {
  if (fileNames.length === 0) throw new Error('Chưa có video để ghép.');
  const [width, height] = aspectRatio === '16:9' ? [1280, 720] : [720, 1280];
  const filters = fileNames.map((_, i) => `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24,setpts=PTS-STARTPTS[v${i}]`);
  if (withAudio) filters.push(...fileNames.map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,asetpts=PTS-STARTPTS[a${i}]`));
  filters.push(`${fileNames.map((_, i) => `[v${i}]${withAudio ? `[a${i}]` : ''}`).join('')}concat=n=${fileNames.length}:v=1:a=${withAudio ? 1 : 0}[outv]${withAudio ? '[outa]' : ''}`);
  return [
    ...fileNames.flatMap(name => ['-i', name]), '-filter_complex', filters.join(';'), '-map', '[outv]',
    ...(withAudio ? ['-map', '[outa]', '-c:a', 'aac', '-b:a', '192k'] : ['-an']),
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '24', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-y', 'merged_output.mp4',
  ];
}

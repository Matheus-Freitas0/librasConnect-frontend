export function normalizedToVideoElementPixel(
  nx: number,
  ny: number,
  video: HTMLVideoElement,
): readonly [number, number] {
  const dw = video.clientWidth
  const dh = video.clientHeight
  const sw = video.videoWidth
  const sh = video.videoHeight
  if (dw <= 0 || dh <= 0) {
    return [nx * dw, ny * dh] as const
  }
  if (!Number.isFinite(sw) || !Number.isFinite(sh) || sw <= 0 || sh <= 0) {
    return [nx * dw, ny * dh] as const
  }

  const fit = (typeof window !== 'undefined' ? window.getComputedStyle(video).objectFit : 'fill') || 'fill'

  if (fit === 'contain') {
    const scale = Math.min(dw / sw, dh / sh)
    const displayedW = sw * scale
    const displayedH = sh * scale
    const offsetX = (dw - displayedW) / 2
    const offsetY = (dh - displayedH) / 2
    return [offsetX + nx * displayedW, offsetY + ny * displayedH] as const
  }

  if (fit === 'cover') {
    const scale = Math.max(dw / sw, dh / sh)
    const displayedW = sw * scale
    const displayedH = sh * scale
    const offsetX = (dw - displayedW) / 2
    const offsetY = (dh - displayedH) / 2
    return [offsetX + nx * displayedW, offsetY + ny * displayedH] as const
  }

  return [nx * dw, ny * dh] as const
}

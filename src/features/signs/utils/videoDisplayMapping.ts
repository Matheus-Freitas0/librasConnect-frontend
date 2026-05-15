export type VideoDisplayMapping = {
  map: (nx: number, ny: number) => readonly [number, number]
}

type MappingCacheEntry = {
  key: string
  mapping: VideoDisplayMapping
}

const mappingCache = new WeakMap<HTMLVideoElement, MappingCacheEntry>()

function mappingCacheKey(video: HTMLVideoElement): string {
  const fit =
    typeof window !== 'undefined' ? window.getComputedStyle(video).objectFit : 'fill'
  return `${video.clientWidth}|${video.clientHeight}|${video.videoWidth}|${video.videoHeight}|${fit}`
}

export function getVideoDisplayMapping(video: HTMLVideoElement): VideoDisplayMapping {
  const key = mappingCacheKey(video)
  const cached = mappingCache.get(video)
  if (cached?.key === key) {
    return cached.mapping
  }

  const dw = video.clientWidth
  const dh = video.clientHeight
  const sw = video.videoWidth
  const sh = video.videoHeight

  let map: VideoDisplayMapping['map']

  if (dw <= 0 || dh <= 0 || !Number.isFinite(sw) || !Number.isFinite(sh) || sw <= 0 || sh <= 0) {
    map = (nx, ny) => [nx * dw, ny * dh] as const
  } else {
    const fit =
      (typeof window !== 'undefined' ? window.getComputedStyle(video).objectFit : 'fill') || 'fill'

    if (fit === 'contain') {
      const scale = Math.min(dw / sw, dh / sh)
      const displayedW = sw * scale
      const displayedH = sh * scale
      const offsetX = (dw - displayedW) / 2
      const offsetY = (dh - displayedH) / 2
      map = (nx, ny) => [offsetX + nx * displayedW, offsetY + ny * displayedH] as const
    } else if (fit === 'cover') {
      const scale = Math.max(dw / sw, dh / sh)
      const displayedW = sw * scale
      const displayedH = sh * scale
      const offsetX = (dw - displayedW) / 2
      const offsetY = (dh - displayedH) / 2
      map = (nx, ny) => [offsetX + nx * displayedW, offsetY + ny * displayedH] as const
    } else {
      map = (nx, ny) => [nx * dw, ny * dh] as const
    }
  }

  const mapping = { map }
  mappingCache.set(video, { key, mapping })
  return mapping
}

export function normalizedToVideoElementPixel(
  nx: number,
  ny: number,
  video: HTMLVideoElement,
): readonly [number, number] {
  return getVideoDisplayMapping(video).map(nx, ny)
}

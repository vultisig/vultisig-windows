interface ImageCapture {
  track: MediaStreamTrack
  grabFrame(): Promise<ImageBitmap>
}

interface Window {
  ImageCapture?: {
    new (track: MediaStreamTrack): ImageCapture
  }
}

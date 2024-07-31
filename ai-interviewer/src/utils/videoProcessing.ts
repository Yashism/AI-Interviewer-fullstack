export function processVideoFrame(
    inputCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement,
    video: HTMLVideoElement
  ): boolean {
    // Check if the video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return false; // Video not ready, skip processing
    }
  
    const ctx = inputCanvas.getContext('2d');
    const outCtx = outputCanvas.getContext('2d');
  
    if (!ctx || !outCtx) return false;
  
    // Check if video dimensions are valid
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return false; // Invalid video dimensions, skip processing
    }
  
    // Set canvas sizes
    inputCanvas.width = video.videoWidth;
    inputCanvas.height = video.videoHeight;
    outputCanvas.width = video.videoWidth;
    outputCanvas.height = video.videoHeight;
  
    // Draw the current video frame to the input canvas
    ctx.drawImage(video, 0, 0, inputCanvas.width, inputCanvas.height);
  
    try {
      // Get the image data
      const imageData = ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
      const data = imageData.data;
  
      // Process the image data
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
  
        if (isCloseToGreen(red, green, blue)) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
  
      // Put the processed image data on the output canvas
      outCtx.putImageData(imageData, 0, 0);
      return true; // Processing successful
    } catch (error) {
      console.error('Error processing video frame:', error);
      return false; // Processing failed
    }
  }
  
  function isCloseToGreen(red: number, green: number, blue: number): boolean {
    return green > 90 && red < 90 && blue < 90;
  }
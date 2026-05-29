export const generateImageAPI = async (prompt: string, type: 'image' | 'video' = 'image') => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (type === 'video') {
    // For demonstration, we'll use a placeholder video from Google (using https to avoid mixed content).
    const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    return videoUrl;
  } else {
    // Return a random high-quality image URL for non-video types
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/1280/720`;
  }
};

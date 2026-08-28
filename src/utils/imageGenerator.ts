export const generateImageAPI = async (prompt: string, type: 'image' | 'video' = 'image', resolution: string = '1280/720', negativePrompt: string = '') => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 提示词与负面提示词已记录（实际接入时传入后端模型）
  if (negativePrompt) {
    console.log('[生成引擎] 正面提示词:', prompt.slice(0, 100));
    console.log('[生成引擎] 负面提示词:', negativePrompt.slice(0, 100));
  }

  if (type === 'video') {
    // For demonstration, we'll use a placeholder video from Google (using https to avoid mixed content).
    const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    return videoUrl;
  } else {
    // Return a random high-quality image URL for non-video types
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/${resolution}`;
  }
};

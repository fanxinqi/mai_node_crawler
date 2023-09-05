const imageloader = (src) => {
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    // 跨域
    image.crossOrigin = "";
    image.src = src;

    image.onload = () => resolve(image);
    image.onerror = reject;
  });
  return promise;
};

module.exports = imageloader;

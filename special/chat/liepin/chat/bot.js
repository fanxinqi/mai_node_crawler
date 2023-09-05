/**
 * 图片下载器
 * @param {*} src
 * @returns {Promise<image>}
 */
const imageloader = (src) => {
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    // 跨域
    image.crossOrigin = null;
    image.src = src;

    image.onload = () => resolve(image);
    image.onerror = reject;
  });
  return promise;
};

const uploadImage = require("../utils/upload-image.js");
const getFileStream = require("../utils/get-file-stream.js");

/**
 * wx 视频爬取任务
 * @param {*} context
 */
const wxImageTask = async (context) => {
  const { url } = context.task || {};
  const stream = await getFileStream(url);
  const res = await uploadImage(stream, encodeURIComponent(url));
  const resultUrl = res.tokenInfo.url;
  console.log(resultUrl);
};
module.exports = wxImageTask;

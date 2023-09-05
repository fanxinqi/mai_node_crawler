const request = require("../utils/request.js");
const saveHtml = require("../utils/save-html.js");
const axios = require("axios");
const fs = require("fs");

const getFileStream = require("../utils/get-file-stream.js");
const upload = require("../utils/upload.js");

const getVideoUrl = (brower, url, vid) => {
  return new Promise((resolve, reject) => {
    brower.open(url);
    brower.eventEmitter.on("video_loaded", async (video_url) => {
      if (video_url.includes(vid)) {
        const fileStream = await getFileStream(video_url);
        const res = await upload(fileStream);
        resolve(res);
      }
    });
  });
};
/**
 * wx 视频爬取任务
 * @param {*} context
 */
const wxVideoTask = async (context) => {
  const { url, vid = "wxv_2848695386960609283" } = context.task || {};
  const { brower } = context || {};
  const res = await getVideoUrl(brower, url, vid);
  const resultUrl = `https://t9.taou.com/${res.tokenInfo.key}`;
  console.log(resultUrl);
};
module.exports = wxVideoTask;

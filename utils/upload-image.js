const qiniu = require("qiniu");
const request = require("./request");
const sizeOf = require("image-size");
const stream = require("stream");
async function getToken(fileName, size, x_size, y_size) {
  const tokenInfo = await request.get(
    `http://front:8540/file/pre_upload?u=6&svtype=14&t=2&p=0&fname=${fileName}&s=${size}&x=${x_size}&y=${y_size}&video_type=0&duration=0`
  );
  return tokenInfo;
}

function uploadFile(readableStream, key, token) {
  return new Promise((resolve, reject) => {
    var config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z3;
    // 是否使用https域名
    config.useHttpsDomain = true;
    // 上传是否使用cdn加速
    config.useCdnDomain = true;

    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    // 文件上传
    formUploader.putStream(
      token,
      key,
      readableStream,
      putExtra,
      function (respErr, respBody, respInfo) {
        if (respErr) {
          throw respErr;
        }

        if (respInfo.statusCode == 200) {
          resolve(respBody);
        } else {
          reject();
        }
      }
    );
  });
}

const getStreamSize = async (stream) => {
  let total = 0;
  let buffers = [];

  // Iterate response.body (a ReadableStream) asynchronously
  for await (const chunk of stream) {
    // Do something with each chunk
    // Here we just accumulate the size of the response.
    total += chunk.length;
    buffers.push(chunk);
  }

  return {
    buffer: Buffer.concat(buffers),
    total: total,
  };
};

module.exports = async (readableStream, fileName) => {
  let tokenInfo = {};
  let { total, buffer } = await getStreamSize(readableStream);
  const imageSize = sizeOf(buffer);
  const bufferStream = new stream.PassThrough();
  const streams = bufferStream.end(buffer);
  try {
    const res =
      (await getToken(fileName, total, imageSize.width, imageSize.height)) ||
      {};
    tokenInfo = res;
  } catch (error) {
    throw error;
  }

  if (!tokenInfo.token) throw "token get error";

  console.log(tokenInfo);
  return {
    uploadRes: await uploadFile(streams, tokenInfo.key, tokenInfo.token),
    tokenInfo: tokenInfo,
  };
};

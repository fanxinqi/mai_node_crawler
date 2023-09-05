const qiniu = require("qiniu");
const request = require("./request");

async function getToken() {
  const tokenInfo = await request.get(
    "http://front:8540/cooperation/pre_upload_video?channel=www&fuid=6&version=1.0.0&u=6"
  );
  return tokenInfo;
}
// const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

function uploadFile(
  readableStream,
  key = "maimai/origin-av/t/33707/3033_12_511QJNQx3VpvEtXo",
  token = "59-t0r1h1MpKALL2KJw6FQn815BheAk3EhjxNPh4:V7I7AciwHKF7rBwew-n9Biaj9vo=:eyJzY29wZSI6Im1haW1haS10czptYWltYWkvb3JpZ2luLWF2L3QvMzM3MDcvMzAzM18xMl81MTFRSk5ReDNWcHZFdFhvIiwiZGVhZGxpbmUiOjE2ODAwMDUwOTgsInBlcnNpc3RlbnRPcHMiOiJhdnRodW1iL21wNC9ub0RvbWFpbi8xfHNhdmVhcy9iV0ZwYldGcExYUnpPbTFoYVcxaGFTOTBMek16TnpBM0x6TXdNek5mTVRKZk5URXhVVXBPVVhnelZuQjJSWFJZYnc9PSIsInBlcnNpc3RlbnRQaXBlbGluZSI6Im1haW1haS1waXBlbGluZSIsImRldGVjdE1pbWUiOjEsInBlcnNpc3RlbnROb3RpZnlVcmwiOiJodHRwczovL29wZW4udGFvdS5jb20vbWFpbWFpL2ZpbGUvY2FsbGJhY2svcWluaXVfdmlkZW9fY2I_ZmlkPTMzNzA3MzAzMyJ9"
) {
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

module.exports = async (readableStream) => {
  let tokenInfo = {};
  try {
    const res = await getToken() || {};
    tokenInfo = res.data;
  } catch (error) {
    throw error;
  }

  if (!tokenInfo.token) throw "token get error";
  return {
    uploadRes: await uploadFile(readableStream, tokenInfo.key, tokenInfo.token),
    tokenInfo: tokenInfo,
  };
};


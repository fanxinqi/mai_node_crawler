var axios = require("axios");
var FormData = require("form-data");
var fs = require("fs");

const getToken = () => {
  const p = new Promise((resolve, reject) => {
    const data = JSON.stringify({
      app_id: "cli_a0569ecce1f8500d",
      app_secret: "pn68qT8861UXBzNWEIYfH4uLhxcLIE7r",
    });

    const config = {
      method: "POST",
      url:
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return p;
};

const uploadImage = (readStream, token) => {
  const p = new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("image_type", "message");
    data.append("image", readStream);
    const config = {
      method: "post",
      url: "https://open.feishu.cn/open-apis/im/v1/images",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return p;
};


module.exports.uploadImage = uploadImage;

module.exports.getToken = getToken;

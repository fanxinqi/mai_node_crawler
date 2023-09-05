var fs = require("fs");
const { uploadImage, getToken } = require("./utils/upload-feishu-image.js");
const feishu = require("./utils/feishu");
const feishuBotId = "fa3f10df-8309-46d4-a9b8-5821e6761e0c";

(async () => {
  const tokenData = await getToken();
  console.log(tokenData);
  const res = await uploadImage(fs.createReadStream("./1.jpeg"),tokenData.tenant_access_token);
    console.log(res.data);
  // console.log(JSON.stringify(res));
})();

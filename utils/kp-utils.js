const feishu = require("./feishu");
const feishuBotId = "fa3f10df-8309-46d4-a9b8-5821e6761e0c";
const sentMsg = (text, typeText = "chat-bot", fid=feishuBotId) => {
  feishu.sendMsg(
    fid,
    [
      [
        {
          tag: "text",
          un_escape: true,
          text: text,
        },
      ],
    ],
    typeText
  );
};

module.exports = { sentMsg };

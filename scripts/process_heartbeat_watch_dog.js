const net = require("net");
const fs = require("fs");
const pipeFile = process.platform === "win32" ? "\\\\.\\pipe\\mypip" : "/tmp/unix.sock";
const feishuBotId = "fa3f10df-8309-46d4-a9b8-5821e6761e0c";
const child_process = require("child_process");
const feishu = require("../utils/feishu.js");
const log = require("../utils/log");

// 计时相关变量
let myTimer = null
let lastTime = new Date().getTime();

// shell 函数
function exec(shell) {
  try {
    log.info(shell);
    return child_process.execSync(shell, {
      encoding: "utf-8",
    });
  } catch (error) {
    log.error(error);
    return null;
  }
}

// watch dog
const server = net.createServer((connection) => {
  console.log("socket connected.");
  connection.on("close", () => {
    console.log("disconnected.")
    exec("pm2 restart b_flow");
    feishu.sendMsg(
      feishuBotId,
      [
        [
          {
            tag: "text",
            un_escape: true,
            text: `心跳超时，进程重启成功`,
          },
        ],
      ],
      "b-search-watchdog"
    );
  });
  connection.on("data", (data) => {
    let nowTime = new Date().getTime();
    console.log(`${data}`);
    console.log('心跳时间间隔(ms):', nowTime - lastTime);
    lastTime = nowTime
    // 本次心跳正常，清除定时器
    clearInterval(myTimer);

    // 重新计时，如果下次超过2分钟没有发心跳，就重启守护的进程
    myTimer = setTimeout(() => {
      // console.log('开始重启:pm2 restart b_flow');
      exec("pm2 restart b_flow");
      feishu.sendMsg(
        feishuBotId,
        [
          [
            {
              tag: "text",
              un_escape: true,
              text: `心跳超时，进程重启成功`,
            },
          ],
        ],
        "b-search-watchdog"
      );
    }, 1000 * 60 * 2)

    connection.write(data);
    // console.log(`send: ${data}`);
  });
  connection.on("error", (err) => console.error(err.message));
});

try {
  fs.unlinkSync(pipeFile);
} catch (error) { }

server.listen(pipeFile);

const process = require("child_process");
const log = require("../utils/log");
const sleep = require("../utils/sleep");
const request = require("../utils/request");
const feishu = require("../utils/feishu");
const feishuBotId = "fa3f10df-8309-46d4-a9b8-5821e6761e0c";
// const { changeMacNet } = require("../utils/mac");

// adb shell settings get secure android_id android手机对应坐标，key是andorid_id, value 坐标
const deviceChangeNetPosition = {
  c15268c1cab233c2: {
    //
    x: 986,
    y: 558,
  },
  e1e7e220011a93cd: {
    x: 970,
    y: 300,
  },
  "6c2a75560b6bb031": {
    x: 960,
    y: 380,
  },
};

function exec(shell) {
  try {
    // log.info(shell);
    return process.execSync(shell, {
      encoding: "utf-8",
    });
  } catch (error) {
    log.error(error);
    return null;
  }
}

function refreshNet() {
  exec("sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder");
}

function click(x, y) {
  // log.info(`adb shell input tap ${x} ${y}`);
  exec(`adb shell input tap ${x} ${y}`);
}

function loopTouch() {
  log.info(`链接andorid设备：${getAndroidId()}`);
  (async () => {
    while (true) {
      click(500, 120);
      await sleep(30 * 1000);
    }
  })();
}

// 获取andorid id
function getAndroidId() {
  const androidId = exec(`adb shell settings get secure android_id`);
  return androidId ? androidId.replace(/\s/gi, "") : androidId;
}

// 开关网络
async function swichNet() {
  let android_id = getAndroidId();
  const tapPostion = deviceChangeNetPosition[android_id];
  if (tapPostion) {
    click(Number(tapPostion.x), Number(tapPostion.y));
    await sleep(10000);
    click(Number(tapPostion.x), Number(tapPostion.y));
    await sleep(20000);
  } else {
    log.error("寻找网路切换按钮失败");
  }
}

async function testNet() {
  try {
    const $ = await request.getHtml("https://myip.ipip.net/", {
      timeout: 10000,
    });
    return $.text();
  } catch (error) {
    return null;
  }
}

//  change ip
const swichIp = async (isChangeMacNet) => {
  const beforeIp = await testNet();
  const startTime = new Date().getTime();
  await swichNet();
  refreshNet();
  const afterIp = await testNet();
  const endTime = new Date().getTime();
  if (beforeIp && afterIp) {
    log.info(beforeIp + "----切换后----" + afterIp);
    feishu.sendMsg(
      feishuBotId,
      [
        [
          {
            tag: "text",
            un_escape: true,
            text: `切换前:${beforeIp}`,
          },
        ],
        [
          {
            tag: "text",
            un_escape: true,
            text: `切换后:${afterIp}`,
          },
        ],
        [
          {
            tag: "text",
            un_escape: true,
            text: `用时:${Math.floor((endTime - startTime) / 1000)} s`,
          },
        ],
      ],
      "ip切换情况"
    );
  }

  if (!afterIp) {
    throw new Error("切换ip失败,ip为空");
  }

  if (beforeIp == afterIp) {
    throw new Error("切换ip失败,ip相同");
  }

  return afterIp;
};

module.exports = {
  swichIp,
  loopTouch,
};

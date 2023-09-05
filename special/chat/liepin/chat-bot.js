const BrowerPage = require("../../../utils/browser-page");
const log = require("../../../utils/log");
const sleep = require("../../../utils/sleep");
const feishu = require("../../../utils/feishu");
const feishuBotId = "fa3f10df-8309-46d4-a9b8-5821e6761e0c";
const adb = require("../../../adb/");
const service = require("./service/index");
const path = require("path");

let currentUserName;
let browerPage;
let currentList = [];
let limitPhones = []
const initBrower = async () => {
  if (browerPage) {
    await browerPage.destroy();
    await sleep(2000);
  }
  currentList = [];
  browerPage = new BrowerPage({
    headless: false,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  })
}


const login = async (userName, passWord) => {
  log.info(`login:${userName} ${passWord}`)
  await browerPage.open("https://www.liepin.com/", [
    ".login-switch-bar-line>div:nth-child(2)",
  ]);
  log.info(`open home page:https://www.liepin.com/`)
  await browerPage.page.click(".login-switch-bar-line>div:nth-child(2)");
  await browerPage.page.type("#login", userName);
  await browerPage.page.type("#pwd", passWord);
  await browerPage.page.click(".login-agreement input[type='checkbox']");
  await browerPage.page.click(".login-container button");
  await browerPage.await('#tcaptcha_iframe', 20);

  const frame = await browerPage.page.frames()[2];
  await frame.waitForTimeout(1000);
  const getLeftPostion = async (iframe) => {
    const left = await frame.evaluate(async () => {
      const histo = (data, bins) =>
        data.reduce((arr, e) => {
          arr[bins.indexOf(e)] += 1;
          return arr;
        }, [...Array(bins.length)].fill(0));

      const width = (hist, s, e) => {
        let v = 0;
        for (let i = s; i < e; i += 1) {
          v += hist[i];
        }
        return v;
      };

      const bins = (data) =>
        Array.from(new Set(data)).sort((e0, e1) => e0 - e1);

      const weight = (hist, s, e, total) => {
        let v = 0;
        for (let i = s; i < e; i += 1) {
          v += hist[i];
        }
        return v / total;
      };

      const mean = (hist, bins, s, e, width) => {
        let v = 0;
        for (let i = s; i < e; i += 1) {
          v += hist[i] * bins[i];
        }
        return v * width;
      };

      const variance = (hist, bins, s, e, mean, width) => {
        let v = 0;
        for (let i = s; i < e; i += 1) {
          const d = bins[i] - mean;
          v += d * d * hist[i];
        }
        return v * width;
      };

      const cross = (wb, vb, wf, vf) => wb * vb + wf * vf;

      const otsu = (data) => {
        const b = bins(data);
        const h = histo(data, b);
        const { length: total } = data;
        const vars = [...Array(b.length)].map((_, i) => {
          const s0 = 0;
          const e0 = i;
          const s1 = i;
          const e1 = h.length;

          const w0 = 1 / width(h, s0, e0);
          const w1 = 1 / width(h, s1, e1);

          const wb = weight(h, s0, e0, total);
          const vb = variance(h, b, s0, e0, mean(h, b, s0, e0, w0), w0);

          const wf = weight(h, s1, e1, total);
          const vf = variance(h, b, s1, e1, mean(h, b, s1, e1, w1), w1);

          const x = cross(wb, vb, wf, vf);

          return !isNaN(x) ? x : Number.POSITIVE_INFINITY;
        });

        return b[vars.indexOf(Math.min(...vars))];
      };

      const getCrachIndex = (src) => {
        const p = new Promise((resolve, reject) => {
          const imgObj = new Image();
          imgObj.crossOrigin = "";
          imgObj.src = src || "./hycdn.jpeg";

          imgObj.onload = function () {
            const canvas = document.createElement("canvas");
            const c = canvas.getContext("2d");
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            c.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
            const imgData = c.getImageData(0, 0, canvas.width, canvas.height);

            // rgb array
            const rgbArray = [];
            for (var i = 0; i < imgData.data.length; i += 4) {
              var R = imgData.data[i]; //R(0-255)
              var G = imgData.data[i + 1]; //G(0-255)
              var B = imgData.data[i + 2]; //B(0-255)
              rgbArray.push(R);
              rgbArray.push(G);
              rgbArray.push(B);
            }
            const otsuValue = otsu(rgbArray);
            const index = (otsuValue + 255) / 2; //阈值

            // rgb is 0 array
            const rgb0Array = [];
            for (var i = 0; i < imgData.data.length; i += 4) {
              var R = imgData.data[i]; //R(0-255)
              var G = imgData.data[i + 1]; //G(0-255)
              var B = imgData.data[i + 2]; //B(0-255)

              var Alpha = imgData.data[i + 3]; //Alpha(0-255)
              var sum = (R + G + B) / 3;
              if (sum > index) {
                imgData.data[i] = 255;
                imgData.data[i + 1] = 255;
                imgData.data[i + 2] = 255;
                imgData.data[i + 3] = Alpha;
              } else {
                imgData.data[i] = 0;
                imgData.data[i + 1] = 0;
                imgData.data[i + 2] = 0;
                imgData.data[i + 3] = Alpha;
                const x = Math.floor((i / 4) % 680);
                const y = Math.ceil(i / 4 / 680);
                const position = {
                  x,
                  y,
                };
                rgb0Array.push(position);
              }
            }

            const splitX = findBlockGapPosition(rgb0Array);
            resolve(splitX);
          };
        });
        return p;
      };

      /*
       * find block gap position
       * @param array {
       *  x:{number}
       *  y:{number?
       * } 像素为0的数组
       * @return x {number}
       */
      const findBlockGapPosition = (
        array,
        trait = {
          line1Length: 87,
          line2Length: {
            a: 29,
            b: 27,
          },
        }
      ) => {
        // const result = [];
        const tmp = {};
        /**
         * {
          n:连续次数
          y:当前层级,
          s:开始层级
        }*/
        array.forEach((p) => {
          const x = p.x;
          // 存在
          if (tmp[x] && tmp[x].length) {
            const max = tmp[x].length - 1;
            if (tmp[x][max].y == p.y - 1) {
              //连续不改变开始层级
              tmp[x][max].n = tmp[x][max].n + 1;
              tmp[x][max].y = p.y;
            } else {
              // 非连续，改变开始层级,连续层级为1
              tmp[x].push({
                n: 1,
                s: p.y,
                y: p.y,
              });
            }
          } else {
            tmp[x] = [
              {
                n: 1,
                y: p.y,
                s: p.y,
              },
            ];
          }
        });
        const line1 = [];
        const line2 = [];
        Object.keys(tmp).forEach((key) => {
          const postionArray = tmp[key];
          const lineleft = postionArray.find(
            (position) => position.n === trait.line1Length
          );
          const lineRight1 = postionArray.find(
            (position) => position.n === trait.line2Length.b
          );
          const lineRight2 = postionArray.find(
            (position) => position.n === trait.line2Length.a
          );
          if (lineleft) {
            line1.push(key);
          }
          if (lineRight1 && lineRight2) {
            line2.push(key);
          }
        });

        // 交叉求绝对值
        const absArray = [];

        // 一边有缺口
        for (let i = 0; i < line1.length; i++) {
          for (let j = 0; j < line2.length; j++) {
            const absDiff = Math.abs(line1[i] - line2[j]);
            if (absDiff > 83 && absDiff < 87) {
              absArray.push([line1[i], line2[j]]);
            }
          }
        }

        //  两边没有缺口
        for (let i = 0; i < line1.length; i++) {
          for (let j = i + 1; j < line1.length; j++) {
            const absDiff = Math.abs(line1[i] - line1[j]);
            if (absDiff > 83 && absDiff < 87) {
              console.log(line1, line1, absDiff);
              absArray.push([line1[i], line1[j]]);
            }
          }
        }

        // 两边都有缺口
        for (let i = 0; i < line2.length; i++) {
          for (let j = i + 1; j < line2.length; j++) {
            const absDiff = Math.abs(line2[i] - line2[j]);
            if (absDiff > 83 && absDiff < 87) {
              console.log(line2, line2, absDiff);
              absArray.push([line2[i], line2[j]]);
            }
          }
        }
        // console.log(absArray[0].sort()[0]);
        if (absArray.length && absArray[0].length) {
          // console.log(line2);
          return Number(absArray[0].sort()[0]);
        } else {
          return 0;
        }
      };
      // slideBgWrap ç
      const verifyBgSrc = document
        .querySelector("#slideBg")
        .getAttribute("src");
      const left = await getCrachIndex(verifyBgSrc);
      return Promise.resolve(left);
    });
    if (left) {
      return left;
    } else {
      await frame.click("#reload");
      return await getLeftPostion(iframe);
    }
  };

  const tcaptcha_drag_thumb = await frame.$("#tcaptcha_drag_thumb");
  const bounding_box = await tcaptcha_drag_thumb.boundingBox();
  const left = await getLeftPostion();
  log.info(`滑块位置：${left}`);
  sentMsg(`破解验证码成功，验证码位置：${left}`);
  //   return;
  await browerPage.page.mouse.move(
    Math.floor(bounding_box.x + bounding_box.width / 2),
    Math.floor(bounding_box.y + bounding_box.height / 2)
  );
  await browerPage.page.waitForTimeout(100);
  await browerPage.page.mouse.down();
  await browerPage.page.waitForTimeout(100);
  await browerPage.page.mouse.move(
    Math.floor(bounding_box.x + left / 2),
    Math.floor(bounding_box.y + bounding_box.height / 2),
    { steps: Math.floor(left / 2 / 2) }
  );
  await browerPage.page.waitForTimeout(100);
  await browerPage.page.mouse.up();

  try {
    let $ = await browerPage.await(".header-quick-menu-username", 20);
    if ($ && $(".header-quick-menu-username").length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const sentMsg = (text) => {
  feishu.sendMsg(
    feishuBotId,
    [
      [
        {
          tag: "text",
          un_escape: true,
          text: text,
        },
      ],
    ],
    "chat-bot"
  );
};

const chatLiepin = async ({
  jobUrl = "https://www.liepin.com/job/1913117125.shtml",
  currentUserName
}) => {
  let $ = await browerPage.open(jobUrl+'?from=1', [".recruiter-container"]);
  if ($ == null) {
    throw `.recruiter-container element get timeout`;
  }
  await browerPage.page.waitForTimeout(200);
  await browerPage.page.click(".btn-chat");
  await browerPage.page.waitForTimeout(200);
  log.info("进入聊天");
  await browerPage.await([
    ".__im_basic__c-chatwin-action-send-phone",
  ]);
  log.info("click 交换手机号 button");
  await browerPage.page.click(
    ".__im_basic__c-chatwin-action-send-phone"
  );
  $ = await browerPage.await(".im-dialog-content",20);
  if ($ && $(".im-dialog-content").text() === "确认向对方交换手机号？") {
    await browerPage.page.click(".btn-ok");
    log.info(`开始交换手机号,请用${currentUserName}账号打开：${jobUrl}`);
    sentMsg(`开始交换手机号,请用${currentUserName}账号打开:${jobUrl}`);

    // $ = await browerPage.await(".im-dialog-content",20);
    if ($ && $(".im-dialog-content").text() && $(".im-dialog-content").text().includes("已达上限")) {
      log.warn(`交换手机号已达上限,请用${currentUserName}账号打开：${jobUrl},done:${currentList.length}`);
      sentMsg(`交换手机号已达上限,请用${currentUserName}账号打开：${jobUrl},done:${currentList.length}`);
      throw `交换手机号已达上限`;
    } else {
      currentList.push(jobUrl)
    }
  }
  else {
    log.warn("交换手机号条件没有命中");
  }

  await browerPage.page.click(".__im_basic__c-chatwin-action-send-resume");
  $ = await browerPage.await(".im-dialog-content");
  if (
    Object.prototype.toString.call($) == "[object Function]" &&
    $(".im-dialog-content").text() === "您确认要发送简历么？"
  ) {
    await browerPage.await(".btn-ok");
    await browerPage.page.click(".btn-ok");
    sentMsg(`发送简历成功,请用${currentUserName}账号打开:${jobUrl}`);
    log.info("发送简历结束");
  } else {
    log.warn("简历发送条件没有命中");
  }
};

const upload = async () => {
  await browerPage.open(
    "https://c.liepin.com/resume/getdefaultresume?editType=attachment&editId=",
    "body .upload-btn-box"
  );

  let input = await browerPage.page.waitForXPath('//input[@type="file"]');
  await browerPage.page.click("body .upload-btn-box");
  await input.uploadFile(`${process.cwd()}/special/chat/liepin/doc/01.pdf`);
  await sleep(1000);
  await browerPage.page.click("body .btn-submit");
  console.log(`Current directory: ${process.cwd()}`);
  // await input.uploadFile("/path/to/file");
};

const sendChat = async ({ userName, userPassword, jobUrl }) => {
  if (userName !== currentUserName) {
    await Promise.all([adb.swichIp(), initBrower()]);
    log.info("开始登陆");
    await sleep(1000);
    log.info("sleep 1s");
    const res = await login(userName, userPassword);
    if (res) {
      currentUserName = userName;
      sentMsg(`${userName}:已登陆, 正在执行的任务：${jobUrl}`);
      // log
      log.info("登陆成功～");
    } else {
      currentUserName = null;
      sentMsg(`${userName}:登陆失败，先跳过该任务：${jobUrl}`);
      log.error("登陆失败～");
      log.file(
        `${userName}___${jobUrl}`,
        path.join(__dirname, "./error/login.json")
      );
      throw "登陆失败";
    }
  }

  await sleep(2000);
  await chatLiepin({
    jobUrl,
    currentUserName
  });
};

(async () => {
  await initBrower();
  try {
    adb.loopTouch();
  } catch (error) {
    log.error(error);
  }
  while (true) {
    const task = (await service.getTask()) || {};
    try {
      if (task && task.ID && limitPhones.includes(task.PHONE)) {
        log.info("limit's task, don't exec this task..");
        // status = 10, limit status
        await service.updateTask(task.ID, 10);
      }
      else if (task && task.ID) {
        await sendChat({
          userName: task.PHONE,
          userPassword: task.PASSWORD,
          jobUrl: task.JOB_URL,
        });
        // 任务成功执行
        await service.updateTask(task.ID, 0);
        log.info(`任务执行完毕，任务id:${task.ID}}`);
      }
      else {
        await sleep(3000);
        log.info("暂无任务执行...");
      }
    } catch (error) {
      if (task && task.ID) {
        let oldStatus = parseInt(task.STATUS)
        let newStatus = oldStatus === -1 ? 1 : oldStatus + 1
        await service.updateTask(task.ID, newStatus);
        log.warn(error);
        if (error == '交换手机号已达上限') {
          limitPhones.push(task.PHONE);
        }
      }
    }
  }
})();

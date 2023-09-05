const log = require("../../../../utils/log");
const feishu = require("../../../../utils/feishu");
const feishuBotId = "fa3f10df-8309-46d4-a9b8-5821e6761e0c";

const getErorrMsg = (userName, passWord) => {
  return `${userName}/${passWord}:登陆失败`;
};

const getSuccessMsg = (userName, passWord) => {
  return `${userName}/${passWord}:登陆成功`;
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

const getInitStatus = async (browerPage) => {
  let $ = null;
  try {
    $ = (await browerPage.await(".resume-complete-container", 3)) || null;
  } catch (error) {
    console.log(error);
    return null;
  }
  return $;
};

const login = async ({ browerPage, userName, passWord }) => {
  log.info(`login:${userName} ${passWord}`);
  await browerPage.open(
    "https://www.liepin.com/",
    ".login-switch-bar-line>div:nth-child(1)"
  );
  log.info(`open home page:https://www.liepin.com/`);
  await browerPage.await(".login-switch-bar-line>div:nth-child(1)", 20);
  await browerPage.await("#tel", 20);
  await brower.page.type("#tel", userName.toString());
  await brower.page.click(".get-smscode-btn");
  await browerPage.page.click(".login-agreement input[type='checkbox']");
  await browerPage.page.click(".login-container button");
  await browerPage.await("#tcaptcha_iframe", 20);
  log.info("tcoptcha show");
  const frame = await browerPage.page.frames()[2];
  if (!frame) throw `iframe not find~`;
  await frame.waitForTimeout(1000);
  log.info("tcoptcha wait end");
  let tryNum = 0;
  const getLeftPostion = async (iframe) => {
    let left = await frame.evaluate(async () => {
      try {
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
      } catch (error) {
        return Promise.reject(left);
      }
    });
    if (left) {
      return left;
    } else {
      tryNum++;
      if (tryNum < 4) {
        await frame.waitForTimeout(1000);
        await frame.click("#reload");
        try {
          return await getLeftPostion(frame);
        } catch (error) {
          throw error;
        }
      } else {
        throw "破解验证码 error";
      }
    }
  };

  const tcaptcha_drag_thumb = await frame.$("#tcaptcha_drag_thumb");
  if (!tcaptcha_drag_thumb) throw "tcaptcha_drag_thumb not find~";
  const bounding_box = await tcaptcha_drag_thumb.boundingBox();

  if (!bounding_box) throw "bounding_box not find~";

  log.info("tcaptcha_drag_thumb");
  let left;
  try {
    left = await getLeftPostion(frame);
  } catch (error) {
    throw error;
  }

  log.info(`滑块位置：${left}`);
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

  sentMsg(`破解验证码成功，验证码位置：${left}`);
  try {
    let $ = await browerPage.await(
      [
        ".header-quick-menu-username",
        ".ant-message-notice-content",
        ".resume-complete-container",
      ],
      20
    );

    // try {
    //   new$ = await browerPage.await(".resume-complete-container", 3) || null
    // } catch (error) {
    //   console.log(error);
    // }

    if ($(".resume-complete-container").length > 0) {
      log.info(`${userName}/${passWord}:初始化状态`);
      return "init";
    }
    let new$ = await getInitStatus(browerPage);
    if (new$) {
      $ = new$;
    }

    if ($(".resume-complete-container").length > 0) {
      log.info(`${userName}/${passWord}:初始化状态`);
      return "init";
    }
    if ($(".ant-message-notice-content").length > 0) {
      log.error(`${userName}/${passWord}:被封禁`);
      return "banned";
    }
    if ($ && $(".header-quick-menu-username").length > 0) {
      const msg = getSuccessMsg(userName, passWord);
      log.info(msg);
      sentMsg(msg);
      return true;
    } else {
      log.error(`${userName}/${passWord}:登陆失败`);
      return false;
    }
  } catch (error) {
    const msg = getErorrMsg(userName, passWord);
    log.error(msg);
    return false;
  }
};

module.exports = login;

const BrowerPage = require("../utils/browser-page");
const { browerUa, feishuBotId, getCompanyDataPath } = require("../config.js");
const log = require("../utils/log");
const sleep = require("../utils/sleep");

const brower = new BrowerPage({
  headless: false,
  ua: '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.0 Safari/537.36',
});
(async function main() {
  let $ = await brower.open("https://www.itjuzi.com/bulletin", "#__nuxt");

  await brower.page.evaluate(function () {
    /* 这里做的是渐进滚动，如果一次性滚动则不会触发获取新数据的监听 */
    let timer = setInterval(function () {
      window.scrollTo(0, window.scrollY + 100);
    }, 100);

    window.itjuzidata = [];

    function updateItjuziData(mutation) {
      if (!mutation.target) return false;
      if (
        mutation.target.querySelector(".css-kmHjBH3 span:nth-child(1)") === null
      )
        return false;

      window.itjuzidata.push({
        company: mutation.target.querySelector(".css-Q3Y23wd a").innerText,
        type: mutation.target.querySelector(".css-vbRJm7G").innerText,
        des: mutation.target.querySelector(".css-kjemB--").innerText,
        time: mutation.target.querySelector(".css-kmHjBH3 span:nth-child(1)")
          .innerText,
      });
    }

    function checkEnd(mutation) {
      if (!mutation.target) return false;
      if (
        mutation.target.querySelector(".css-kmHjBH3 span:nth-child(1)") === null
      )
        return false;
      const endText = mutation.target.querySelector(
        ".css-kmHjBH3 span:nth-child(1)"
      ).innerText;
      return endText === "2022-12-30";
    }

    let callback = function (mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          if (mutation.addedNodes.length > 0) {
            // clearInterval(timer);
            updateItjuziData(mutation);
            if (checkEnd(mutation)) {
              observer.disconnect();
              clearInterval(timer);
            }
          }
        }
      }
    };
    let observer = new MutationObserver(callback);
    observer.observe(document.querySelector("#__nuxt"), {
      childList: true, // 观察直接子节点
      subtree: true, // 及其更低的后代节点
    });
  });
})();

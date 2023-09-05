const singleBrower = require("../../../../utils/single-brower")({
  headless: false
});
const login = require("./login.js");
const log = require("../../../../utils/log");

const { getTask, updateTask } = require("../service/lchat");
const sleep = require("../../../../utils/sleep");

const { saveCompanyOrJobInfo } = require("../../../../service");
const adb = require("../../../../adb");

const getChatData = async ({ browerPage, task }) => {
  await browerPage.await("#im-c-entry", 10);
  log.info(`点击：#im-c-entry`);
  await sleep(500);
  await browerPage.page.click("#im-c-entry");

  log.info(`await im-contact .__im_basic__contacts-wrap`);
  let $ = await browerPage.await("#im-contact .__im_basic__contacts-wrap", 20);
  // retry 一次
  if ($ === null) {
    await sleep(500);
    await browerPage.page.click("#im-c-entry");

    log.info(`await im-contact .__im_basic__contacts-wrap`);
    let $ = await browerPage.await(
      "#im-contact .__im_basic__contacts-wrap",
      20
    );
  }

  const scrollChat = await browerPage.page.evaluate(async () => {
    async function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    const scrollItem = document.querySelector(
      "#im-contact .__im_basic__contacts-wrap"
    );
    if (!scrollItem) return false;
    let n = 0;
    while (n < 10) {
      n++;
      scrollItem.scrollTop = 1000 * n;
      if (document.querySelector(".__im_basic__max-contacts")) {
        return true;
      }
      await sleep(500);
    }
    return false;
  });

  const chatlistNumber = await browerPage.page.evaluate(async () => {
    const chatlist = document.querySelectorAll(
      "#im-contact .__im_basic__contacts-wrap  .__im_basic__list-item"
    );
    return chatlist.length;
  });

  // 点击
  if (scrollChat && chatlistNumber) {
    const messageAll = [];
    log.info("chat 窗口滚动底部成功");
    for (let index = 0; index < chatlistNumber; index++) {
      //   if (index == 0) {
      try {
        const chatPSelector = `#im-contact .__im_basic__contacts-wrap  .__im_basic__list-item:nth-child(${index + 1
          })`;
        await browerPage.page.click(chatPSelector);
        let n = 0;
        let $;
        while (n < 3) {
          n++;
          $ = await browerPage.await("#im-chatwin .__im_basic__user-title");
          const clickTitle = $(chatPSelector)
            .find(".__im_basic__contact-title-name")
            .text();
          const clickSubTitle = $(chatPSelector)
            .find(".__im_basic__contact-title-title")
            .text();
          const title = $("#im-chatwin .__im_basic__user-title").text();
          const subtitle = $("#im-chatwin .__im_basic__user-sub-title").text();
          log.info(`title:${title}`)
          log.info(`clickTitle${clickTitle}`)
          log.info(`subtitle${subtitle}`)
          log.info(`clickSubTitle${clickSubTitle}`)

          if (clickTitle.includes(title)) {
            break;
          }
        }
        if (n > 2) {
          break;
        }

        //去除前两位就是 recruiterId
        const idx_rid = $(chatPSelector).attr("data-key");

        let messgeArray = [];
        const $messageListDom = $(
          ".__im_basic__msg-list-content>.__im_basic__message"
        );
        $messageListDom.each((i, item) => {
          messgeArray.push($(item).text());
        });
        messageAll.push({
          idx_rid,
          chat: messgeArray,
        });
      } catch (error) {
        log.error(error);
      }

      //   }
    }
    // 本地sqlit存任务状态
    updateTask(task.ID, 0);
    // 上传数据库
    await saveCompanyOrJobInfo({
      type: "lchat",
      phone: task.PHONE,
      password: task.PASSWORD,
      chats: messageAll,
    });
    log.info(`task:${task.ID},保存消息成功，消息个数：${messageAll.length}`);
  } else {
    throw "chat 窗口滚动底部失败";
  }
};

const changeBrower = async () => {
  return await singleBrower.restart();
};

let currentUserName;

// main run
(async () => {
  adb.loopTouch();
  const runOneTask = async () => {
    let browerPage = singleBrower.getInstance();
    const task = (await getTask()) || {};
    if (!task.ID) {
      log.info("暂无任务执行...");
      sleep(3000);
      return;
    }

    if (task.PHONE == currentUserName) {
      log.info(`${task.PHONE},done,跳过该任务`);
      let oldStatus = parseInt(task.STATUS)
      let newStatus = oldStatus === -1 ? 0 : oldStatus + 1
      // 保存任务状态，跳过该任务
      updateTask(task.ID, newStatus);
      return;
    }
    
    let islogin = false;
    try {
      browerPage = await changeBrower()
      await adb.swichIp()
      islogin = await login({
        browerPage,
        userName: task.PHONE,
        passWord: task.PASSWORD,
      });
      currentUserName = task.PHONE;
    } catch (error) {
      log.info(error)
      let oldStatus = parseInt(task.STATUS)
      let newStatus = oldStatus === -1 ? 0 : oldStatus + 1
      // 保存任务状态，跳过该任务
      updateTask(task.ID, newStatus);
    }

    if (!islogin) {
      let oldStatus = parseInt(task.STATUS)
      let newStatus = oldStatus === -1 ? 0 : oldStatus + 1
      updateTask(task.ID, newStatus);
      return;
    }

    try {
      await getChatData({
        browerPage,
        task,
      });
    } catch (error) {
      // 保存任务状态，跳过该任务
      let oldStatus = parseInt(task.STATUS)
      let newStatus = oldStatus === -1 ? 0 : oldStatus + 1
      updateTask(task.ID, newStatus);
      log.error(error);
    }

  };
  while (true) {
    try {
      await runOneTask();
    } catch (error) {
      log.info(error);
    }
  }
})();

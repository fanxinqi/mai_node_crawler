const log = require("../utils/log");
const { sentMsg } = require("../utils/kp-utils");
module.exports = async (env, taskContent) => {
  if (!taskContent["job"]) return;
  const jobUrl = taskContent["job"];
  const phone = taskContent["keyword"];

  let $ = await env
    .getBrower()
    .open(jobUrl, [
      ".recruiter-container",
      ".apply-stop-title",
      ".stop-job-apply-content",
    ]);

  if ($ == null) {
    throw `.recruiter-container element get timeout`;
  }

  if (
    $(".apply-stop-title").length > 0 ||
    $(".stop-job-apply-content").length > 0
  ) {
    return "stop_hire";
  }
  await env.getBrower().page.waitForTimeout(200);
  await env.getBrower().page.click(".btn-chat");
  await env.getBrower().page.waitForTimeout(200);
  log.info("进入聊天");
  await env.getBrower().await([".__im_basic__c-chatwin-action-send-phone"], 20);
  log.info("click 交换手机号 button");
  await env.getBrower().page.click(".__im_basic__c-chatwin-action-send-phone");
  try {
    $ = await env
      .getBrower()
      .await(
        ".__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p",
        20
      );
  } catch (error) {
    log.warn("已交换过手机号");
  }
  if (
    $ &&
    $(
      ".__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p"
    ).text() === "确定和对方交换手机号吗?"
  ) {
    await env.getBrower().page.click(".__im_basic__askfor-confirm-modal .ant-btn-primary");
    log.info(`开始交换手机号,请用${phone}账号打开：${jobUrl}`);
    sentMsg(`开始交换手机号,请用${phone}账号打开:${jobUrl}`);

    // $ = await env.getBrower().await('.__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p',20);
    if (
      $ &&
      $(
        ".__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p"
      ).text() &&
      $(".__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p")
        .text()
        .includes("已达上限")
    ) {
      log.warn(`交换手机号已达上限,请用${phone}账号打开：${jobUrl}`);
      sentMsg(`交换手机号已达上限,请用${phone}账号打开：${jobUrl}`);
      throw `交换手机号已达上限`;
    }
  } else {
    log.warn("交换手机号条件没有命中");
  }

  await env.getBrower().await([".__im_basic__c-chatwin-action-send-resume"], 20);
  await env.getBrower().page.click(".__im_basic__c-chatwin-action-send-resume");
  try {
    $ = await env
      .getBrower()
      .await(".__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p");
  } catch (error) { }
  if (
    Object.prototype.toString.call($) == "[object Function]" &&
    $(
      ".__im_basic__askfor-confirm-modal .ant-modal-confirm-title >p"
    ).text() === "确定向对方发送简历吗？"
  ) {
    await env.getBrower().await(".__im_basic__askfor-confirm-modal .ant-btn-primary");
    await env.getBrower().page.click(".__im_basic__askfor-confirm-modal .ant-btn-primary");
    sentMsg(`发送简历成功,请用${phone}账号打开:${jobUrl}`);
    log.info("发送简历结束");
  } else {
    log.warn("简历发送条件没有命中");
  }
};

module.exports = async (env, taskContent) => {
  const brower = env.getBrower();

  const jobUrl = taskContent["job"];
  //   const phone = taskContent["keyword"];
  await brower.open(jobUrl, ".btn-startchat");
  await brower.page.click(".btn-startchat");
  try {
    await brower.await(".startchat-dialog", 2);
    await brower.page.click(".icon-close");
    await brower.page.click(".btn-startchat");
  } catch (error) {}
  await brower.await(".chat-input", 20);
  await brower.page.click(".btn-dict");
  let $ = await brower.await(".sentence-panel", 3);

  let index = 0;

  $("#container  div.sentence-panel > ul > li").each((i, item) => {
    if ($(item).text() === "我可以把我的简历发给您看看吗？") {
      index = i + 1;
    }
  });
  await brower.page.click(
    `#container  div.sentence-panel > ul > li:nth-child(${index})`
  );

  //   await brower.page.evaluate(async () => {
  //     function setFocu(ele) {
  //       ele.focus();
  //       var range = document.createRange();
  //       range.selectNodeContents(ele);
  //       range.collapse(false);

  //       var sel = window.getSelection();
  //       sel.removeAllRanges();
  //       sel.addRange(range);
  //     }
  //     setFocu(document.querySelector(".chat-input"));
  //     document.querySelector(".chat-input").innerHTML =
  //       "我可以把我的简历发给您看看吗？";

  //     //   return true;
  //     setTimeout(() => {
  //       document.querySelector(".btn-sure-v2").click();
  //     }, 100);
  //   });

  //   await brower.page.click(".btn-sure-v2");
  //   const $ = await brower.await(".btn-resume");
  //   const $btnResume = $(".btn-resume");
  //   if ($btnResume.length > 0) {
  //     if ($btnResume.attr("class").includes("unable")) return 'ok';
  //   }
};

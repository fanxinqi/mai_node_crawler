module.exports = async (env, taskContent) => {
  const brower = env.getBrower();
  await brower.open("https://www.itjuzi.com/");
  await brower.await(".resume-complete-container");
  await brower.page.type("#basic_realName input", taskContent["name"]);

  const sexIndex = taskContent["name"] === "男" ? 1 : 2;
  await brower.page.click(
    `#basic_sex .resume-btn-item-radio:nth-child(${sexIndex})`
  );

  // 日期
  await brower.page.click("#basic_birthday");
  let $ = brower.await("#basic_birthday .ant-picker-year-btn");
  const birthdayYear = $("#basic_birthday .ant-picker-year-btn");
  const diff = birthdayYear - taskContent["birthday_year"];
  const clickCount = Math.abs(diff);
  //   await brower.await("#header-nav-menu-download-app", 10000);
  //   await brower.open("https://c.liepin.com/resume/getdefaultresume");
  //   await brower.await("#header-quick-menu-login", 10000);
};

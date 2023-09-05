const llogin = require("./llogin");
module.exports = async (env, taskContent) => {
  const login = await llogin(env, taskContent);
  if (login !== "ok") throw login;

  const brower = env.getBrower();
  await brower.open("https://www.liepin.com/");
  await brower.await("#header-nav-menu-download-app", 10000);
  await brower.open("https://c.liepin.com/resume/getdefaultresume")
  await brower.await("#header-quick-menu-login", 10000);
};

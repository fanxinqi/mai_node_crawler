const log = require("./log.js");
const fs = require("fs");
const dayjs = require("dayjs");
const path = require("path");
module.exports = (name, html) => {
  const day = dayjs().format("YYYY-MM-DD");
  const filePath = path.join(__dirname, `../storage/${day}`);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  const pathName = path.join(filePath, name.split("/").join("___"));
  try {
    fs.writeFileSync(pathName, html, {
      encoding: "utf8",
    });
    log.info(`save html:${pathName}`);
  } catch (error) {
    log.error(error);
  }
};

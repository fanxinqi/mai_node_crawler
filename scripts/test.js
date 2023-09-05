const log = require("../utils/log");
const process = require("child_process");

// shell 函数
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

exec("pm2 restart b_flow");
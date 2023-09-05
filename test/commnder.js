const { program } = require("commander");

const getOpts = () => {
  program.option("-p, --proxy <type>", "proxy server address", "");
  program.option(
    "-u, --useragent <type>",
    "The User-Agent request header is a characteristic string that lets servers and network peers identify the application, operating system, vendor, and/or version of the requesting user agent",
    ""
  );
  program.parse();

  return program.opts();
};
module.exports = getOpts();

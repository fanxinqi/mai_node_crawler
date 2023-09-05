// chat task
const lactivate = require("./lactivate.js");
const lcollect = require("./lcollect.js");
const ldeliver = require("./ldeliver.js");
const llogin = require("./llogin.js");
const lregister = require("./lregister.js");
const lresume = require("./lresume.js");
const llogin_by_code = require("./llogin_by_code.js");

const login = require("./login.js");
const deliver = require("./deliver.js");
const collect = require("./collect.js");

const lwrite_info = require("./lwrite_info.js");
/*
 *  export all task
 */
module.exports = {
  lactivate,
  lcollect,
  ldeliver,
  llogin,
  lregister,
  lresume,
  llogin_by_code,
  login,
  deliver,
  collect,
  lwrite_info
};

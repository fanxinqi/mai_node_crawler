const request = require("../../utils/request");
const log = require("../../utils/log");

// add a task
(async () => {
  const task = {
    type: "gongsi",
    keyword: "/gongsi/26b606fefc497fa41XZ42tq5.html",
    status: "init",
  };
  const res = await request.post(
    "http://fp5:8921/sec/OzoXRa6WVvZQWB5I0WKGuMCaEvgiLqZT/add_task",
    // task

    // {
    //   type: "company_list",
    //   keyword: "/gongsi/_zzz_iy100006_t801/",
    //   status: "init",
    // }
  );
  log.info("添加任务成功" + JSON.stringify(task));
})();

const { getPhone } = require("../service/");
const { initTask } = require("../service/lchat");

(async () => {
  const lchatData = await getPhone();
  const insertValues = lchatData.map((item) => [
    item.PHONE,
    item.PASSWORD,
    -1,
    new Date().getTime(),
  ]);
  console.log(insertValues);

  initTask(insertValues);
})()
// console.log(insertValues);

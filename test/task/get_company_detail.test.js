const get_consume_task = require("../../task/get_consume_task");

test("获取爬虫任务", async ({
}) => {
  const res = await get_consume_task();
  //   console.log(res);
  expect(!!res.type).toBe(true);
  expect(!!res.id).toBe(true);
  expect(!!res.keyword).toBe(true);
});

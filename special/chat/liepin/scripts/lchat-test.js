const { query, createTable, insert } = require("../service");
(async () => {
  createTable();
  const newData = await query(
    "select PHONE, PASSWORD from task group by phone "
  );

  const insertValues = newData.map((item) => [item.PHONE, item.PASSWORD, -1]);
  console.log(insertValues);

  insert(
    `INSERT  INTO PHONE (PHONE, PASSWORD,STATUS) VALUES (?,?,?)`,
    insertValues
  );
})();

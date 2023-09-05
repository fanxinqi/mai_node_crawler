/// Import SqliteDB.
const SqliteDB = require("../../../../utils/db").SqliteDB;
const path = require("path");
const file = path.join(__dirname, "../db/task.db");
const sqliteDB = new SqliteDB(file);
// STATUS = -1 init
// STATUS = 0 success
// STATUS = 1 fail

const createTable = () => {
  /// create table.
  const createTaskSql =
    "CREATE TABLE IF NOT EXISTS LCHAT (ID INTEGER PRIMARY KEY NOT NULL, PHONE TEXT NOT NULL, PASSWORD CHAR(50) NOT NULL, STATUS INT NOT NULL,MESSAGE BLOB,CREATTIME INTEGER,UPDATETIME INTEGER);";
  sqliteDB.createTable(createTaskSql);
};

// order by phone
const getTask = async () => {
  querySql =
    `select * from LCHAT where status = -1 ORDER by PHONE limit 1`;
  try {
    return (await sqliteDB.queryData(querySql))[0] || {};
  } catch (error) {
    return {};
  }
};

const updateTask = async (id, status) => {
  const now = new Date().getTime();
  const updateSql = `update LCHAT set STATUS = ${status}, UPDATETIME = ${now}  where ID = ${id}`;
  sqliteDB.executeSql(updateSql);
};

const initTask = async (values) => {
  const sql = `INSERT  INTO LCHAT (PHONE,PASSWORD,STATUS,CREATTIME) VALUES (?,?,?,?)`;
  sqliteDB.insertData(sql, values);
};

const deleteAllTask = async () => {
  const sql = `DELETE FROM LCHAT`;
  sqliteDB.executeSql(sql);
};

// (async () => {
//   await updateTask(1, -1);
// })();

module.exports.getTask = getTask;
module.exports.updateTask = updateTask;
module.exports.initTask = initTask;
module.exports.deleteAllTask = deleteAllTask;
module.exports.createTable = createTable;

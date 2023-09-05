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
  const createChatSql =
    "CREATE TABLE IF NOT EXISTS CHAT(ID INTEGER PRIMARY KEY NOT NULL, INFO BLOB);";
  sqliteDB.createTable(createChatSql);

  const createTaskSql =
    "CREATE TABLE IF NOT EXISTS TASK(ID INTEGER PRIMARY KEY NOT NULL, PHONE INT NOT NULL, PASSWORD CHAR(50) NOT NULL, JOB_URL TEXT NOT NULL, STATUS INT NOT NULL);";
  sqliteDB.createTable(createTaskSql);

  const createphoneSql =
    "CREATE TABLE IF NOT EXISTS PHONE(ID INTEGER PRIMARY KEY NOT NULL, PHONE INT NOT NULL, PASSWORD CHAR(50) NOT NULL,STATUS INT NOT NULL);";
  sqliteDB.createTable(createphoneSql);
};

const createlchat = () => {
  /// create table.

  const createTaskSql =
    "CREATE TABLE IF NOT EXISTS LCHAT (ID INT PRIMARY KEY NOT NULL, PHONE INT NOT NULL, PASSWORD CHAR(50) NOT NULL, STATUS INT NOT NULL,INf);";
  sqliteDB.createTable(createTaskSql);
};

// order by phone
const getTask = async () => {
  querySql =
    "select ID, PHONE, PASSWORD,JOB_URL,STATUS  from  TASK   where STATUS = 1 ORDER by PHONE   limit 1";
  try {
    return (await sqliteDB.queryData(querySql))[0] || {};
  } catch (error) {
    return {};
  }
};

const updateTask = async (id, status) => {
  const updateSql = `update TASK set STATUS = ${status} where ID = ${id}`;
  sqliteDB.executeSql(updateSql);
};

const initTask = async (values) => {
  const sql = `INSERT  INTO TASK  (PHONE, PASSWORD, JOB_URL,STATUS,CREATTIME) VALUES (?,?,?,?,?)`;
  sqliteDB.insertData(sql, values);
};

const deleteAllTask = async () => {
  const sql = `DELETE FROM TASK`;
  sqliteDB.executeSql(sql);
};

const getPhone = async () => {
  try {
    return await sqliteDB.queryData(
      "select count(*) as JOB_COUNT,PHONE,PASSWORD from task where status =0  group by  PHONE"
    );
  } catch (error) {
    return [];
  }
};

const query = async (sql) => {
  try {
    return await sqliteDB.queryData(sql);
  } catch (error) {
    return [];
  }
};

const insert = async (insertsql, values) => {
  // const sql = `INSERT  INTO TASK  (PHONE, PASSWORD, JOB_URL,STATUS,CREATTIME) VALUES (?,?,?,?,?)`;
  sqliteDB.insertData(insertsql, values);
};

const update = async (sql) => {
  sqliteDB.executeSql(sql);
};


// (async () => {
//   await updateTask(1, -1);
// })();

module.exports.getTask = getTask;
module.exports.updateTask = updateTask;
module.exports.initTask = initTask;
module.exports.deleteAllTask = deleteAllTask;
module.exports.createlchat = createlchat;
module.exports.getPhone = getPhone;
module.exports.query = query;
module.exports.insert = insert;
module.exports.createTable = createTable;
module.exports.update = update;

const path = require("path");
const _ = require("lodash");
const XLSX = require("xlsx");

const service = require("./service");

// xlsx insert db
const initTask = () => {
  const workbook = XLSX.readFile(path.join(__dirname, "./doc/task.xlsx"));
  // 读取 sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 转成 json
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log(data);

  const insertValues = data.map((item) => {
    return [
      item.PHONE.toString(),
      item.PASSWORD,
      item.JOB_URL,
      -1,
      new Date().getTime(),
    ];
  });

  service.initTask(insertValues);
};

const deleteALLTask = () => {
   service.deleteAllTask(); 
}

initTask();

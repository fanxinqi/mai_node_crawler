const service = require("./service/index");

const insertData =  [
    [
      "17050594733",
      "1723b0bc#a852#11",
      "https://www.liepin.com/job/1951880769.shtml",
      -1,
      new Date().getTime(),
    ],
  ];
service.initTask(insertData);

/**
 * 获取图片像素矩阵
 * @param {HTMLImageElement} image
 * @returns {Array}
 */
const getPixelsArray = (image) => {
  const canvas = document.createElement("canvas");
  const c = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  c.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
  const imgData = c.getImageData(0, 0, canvas.width, canvas.height);
  return imgData;
};

/**
 * 获取 rgb 数组
 * @param {Array} pixelsArray 像素矩阵  [r,g,b,opacity,r,g,b,opacity...]
 * @returns {Array} rgb 数组 [r,g,b,r,g,b...]
 */
const getRgbArray = (pixelsArray) => {
  if (!Array.isArray(pixelsArray)) return null;
  const rgbArray = [];
  for (let i = 0; i < pixelsArray.length; i += 4) {
    rgbArray.push(pixelsArray[i]); //r
    rgbArray.push(pixelsArray[i + 1]); //g
    rgbArray.push(pixelsArray[i + 2]); //b
  }
};

/**
 *  二值化 图片数据
 * @param {ImageData} imageData 图片数据
 * @param {Number} threshold  阈值 (0-255)
 * @param  {Function} fn1 黑色循环回调
 * @param  {Function}  fn2 黑色循环回调
 * @returns  imageData
 */
const binary = (imgData, threshold, fn1, fn2) => {
  for (let i = 0; i < imgData.data.length; i += 4) {
    const R = imgData.data[i]; //R(0-255)
    const G = imgData.data[i + 1]; //G(0-255)
    const B = imgData.data[i + 2]; //B(0-255)
    const Alpha = imgData.data[i + 3]; //Alpha(0-255)
    const sum = (R + G + B) / 3;

    if (sum > threshold) {
      // 大于阈值变成白色
      imgData.data[i] = 255;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 255;
      imgData.data[i + 3] = Alpha;
      if (isFunction(fn1)) {
        fn1(i);
      }
    } else {
      // 小于阈值变成黑色
      imgData.data[i] = 0;
      imgData.data[i + 1] = 0;
      imgData.data[i + 2] = 0;
      imgData.data[i + 3] = Alpha;
      if (isFunction(fn2)) {
        fn2(i);
      }
    }
  }
  return imgData;
};

const isFunction = (fn) => {
  return Object.prototype.toString.call(fn) === "[object Function]";
};

/**
 * 找竖线二维矩阵
 * @param {Array} array { x,y }
 * @returns
 */
const findVerticalLineMatrix = (array) => {
  // 同一个x轴连续的y集合的map
  // 比如 1: [n:399,y:399,s:1}] 如果坐标高度是399的话，相当于 x坐标为1的y是一个连续黑线
  // 2: [{n:10,y:1,s:1},{n:20,y:42,s:22}] 相当于x坐标为2的有两条黑线, 开始位置s 以及长度n
  const tmp = {};
  /**
   * {
    n:连续次数
    y:当前层级,
    s:开始层级
  }*/
  array.forEach((p) => {
    const x = p.x;
    // 存在
    if (tmp[x] && tmp[x].length) {
      const max = tmp[x].length - 1;
      if (tmp[x][max].y == p.y - 1) {
        //连续不改变开始层级
        tmp[x][max].n = tmp[x][max].n + 1;
        tmp[x][max].y = p.y;
      } else {
        // 非连续，改变开始层级,连续层级为1
        tmp[x].push({
          n: 1,
          s: p.y,
          y: p.y,
        });
      }
    } else {
      tmp[x] = [
        {
          n: 1,
          y: p.y,
          s: p.y,
        },
      ];
    }
  });
  return tmp;
};

/*
 * find block trait position 寻找黑色块儿特征的 x 坐标
 * @param array {
 *  x:{number}
 *  y:{number?
 * } 像素为0的数组
 * @return x {number}
 */
const findBlock = (
  array,
  trait = {
    fullLineLength: 87,
    notchLineLength: {
      a: 29,
      b: 27,
    },
    blockWidth: {
      max: 87,
      min: 83,
    },
  }
) => {
  const verticalLineMap = findVerticalLineMatrix(array);
  // 符合完整线特征数组
  const fullLineArray = [];
  // 符合凹槽线特征数组
  const notchLineArray = [];

  Object.keys(verticalLineMap).forEach((key) => {
    const postionArray = verticalLineMap[key];
    const fullLineItem = postionArray.find(
      (position) => position.n === trait.fullLineLength
    );
    const notchLineItem1 = postionArray.find(
      (position) => position.n === trait.notchLineLength.b
    );
    const notchLineItem2 = postionArray.find(
      (position) => position.n === trait.notchLineLength.a
    );
    if (fullLineItem) {
      fullLineArray.push({ x: key, other: fullLineItem });
    }
    if (notchLineItem1 && notchLineItem2) {
      notchLineArray.push({ x: key, other: [notchLineItem1, notchLineItem2] });
    }
  });

  // 交叉求绝对值
  const absArray = [];

  for (let i = 0; i < fullLineArray.length; i++) {
    // 一边有缺口
    for (let j = 0; j < notchLineArray.length; j++) {
      const absDiff = Math.abs(fullLineArray[i].x - notchLineArray[j].x);
      if (absDiff > 83 && absDiff < 87) {
        absArray.push([fullLineArray[i], notchLineArray[j]]);
      }
    }
    // 两边没有缺口
    for (let j = i + 1; j < fullLineArray.length; j++) {
      const absDiff = Math.abs(fullLineArray[i].x - fullLineArray[j].x);
      if (absDiff > 83 && absDiff < 87) {
        absArray.push([fullLineArray[i], fullLineArray[j]]);
      }
    }
  }

  // 两边都有缺口
  for (let i = 0; i < notchLineArray.length; i++) {
    for (let j = i + 1; j < notchLineArray.length; j++) {
      const absDiff = Math.abs(notchLineArray[i].x - notchLineArray[j].x);
      if (absDiff > 83 && absDiff < 87) {
        absArray.push([notchLineArray[i], notchLineArray[j]]);
      }
    }
  }

  return absArray;
  // console.log(absArray[0].sort()[0]);
};

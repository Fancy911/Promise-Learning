// 引入 fs 模块
const fs = require('fs');
// 1. 回调函数 形式
// fs.readFile('./resource/content.txt', (err, data) => {
//     // 如果出错 则抛出错误
//     if(err)  throw err;

//     //输出文件内容
//     console.log(data);  // 这样输出的是buffer
//     console.log(data.toString()); // 要用toString()转换成字符串
// });

// Promise 形式
let p = new Promise((resolve , reject) => {
    fs.readFile('./resource/content.txt', (err, data) => {
        //如果出错
        if(err) 
            reject(err);
        //如果成功
        resolve(data);
    });
});
//调用 then 
p.then(value=>{
    console.log(value.toString());
}, reason=>{
    console.log(reason);
});

/**
 * util.promisify 方法
 * 传入一个遵循常见的错误优先的回调风格的函数（即，以(err, value) => ...回调作为最后一个参数），并返回一个返回 promise 的版本
 * 
 */

const util = require('util'); //引入 util 模块
const fs = require('fs'); //引入 fs 模块

// util.promisify返回一个新的函数mineReadFile，而且这个函数返回一个promise对象
let mineReadFile = util.promisify(fs.readFile);

mineReadFile('./resource/content.txt').then(value=>{
    console.log(value.toString());
});
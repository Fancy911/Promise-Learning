class Promise {
    // 构造器
    constructor(executor) {
        // 声明属性 
        this.PromiseState = 'pending'; // 1. promise对象的状态，初始值为pending
        this.PromiseResult = null; // 2. promise对象的结果值，初始值为null
        this.callbacks = []; // 3. 存储then方法中的回调函数，初始值为[]
        // 保存Promise实例对象的this值
        const self = this;
    
        // resolve 函数 
        function resolve(data) {
            // 正确的写法是：在Promise函数内部先声明一个变量self，然后把this赋值给self，这样就可以在resolve函数中使用self了
            // 1. 修改对象的状态 (promiseState)
            if (self.PromiseState !== 'pending') return; // 如果状态不是pending，直接return，保证状态的改变是不可逆的，且从pending变为fulfilled或rejected，只能改变一次
            self.PromiseState = 'fulfilled';
            // 2. 设置对象的结果值 (promiseResult) 
            self.PromiseResult = data;
            // 3. 调用成功的回调函数
            // 加定时器，使then方法中的回调函数异步执行
            setTimeout(() => {
                if (self.callbacks.length > 0) {
                    self.callbacks.forEach(item => {
                        item.onResolved(data);
                    });
                }
            });
        }
        // reject 函数
        function reject(data) {
            // 1. 修改对象的状态 (promiseState)
            if (self.PromiseState !== 'pending') return;
            self.PromiseState = 'rejected';
            // 2. 设置对象的结果值 (promiseResult) 
            self.PromiseResult = data;
            // 3. 调用成功的回调函数
            // 加定时器，使then方法中的回调函数异步执行
            setTimeout(() => {
                if (self.callbacks.length > 0) {
                    self.callbacks.forEach(item => {
                        item.onRejected(data);
                    });
                }
            });
        }
        // 实现throw抛出异常的功能
        try{
            // 执行器函数是同步执行的
            executor(resolve, reject);
        }
        catch(e) {
            // 修改promise对象状态为失败
            reject(e);
        }
    }

    // 添加 then 方法
    then(onResolved, onRejected) {
        const self = this;
        // 判断回调函数参数
        if (typeof onRejected !== 'function') {
            // 如果then方法的第一个参数不是函数，
            // 就给它指定一个默认的函数，这个函数的作用是返回参数本身
            // 这样做的目的是为了实现异常的穿透
            onRejected = reason => {
                throw reason;
            }
        }
        // 实现值的穿透
        if(typeof onResolved !== 'function'){
            onResolved = value => value;
            //value => { return value};
        }
        // 判断PromiseState的状态是fulfilled还是rejected
        // 如果是fulfilled，调用onResolved
        return new Promise((resolve, reject) => {
            // 封装函数
            function callback(type) {
                try {
                    let result = type(self.PromiseResult);
                    if (result instanceof Promise) {
                        result.then(v => {
                            resolve(v);
                        }, r => {
                            reject(r);
                        })
                    }
                    else {
                        resolve(result);
                    }
                }
                catch(e) {
                    reject(e);
                }
            }
            if (this.PromiseState === 'fulfilled') {
                // 加定时器，使then方法中的回调函数异步执行
                setTimeout(() => {
                    callback(onResolved);
                });
            }  
            // 如果是rejected，调用onRejected
            if (this.PromiseState === 'rejected') {
                // 加定时器，使then方法中的回调函数异步执行
                setTimeout(() => {
                    callback(onRejected);
                });
            }
            // 如果是pending，保存回调函数
            if (this.PromiseState === 'pending') {
                // 将回调函数保存到callbacks容器中
                this.callbacks.push({
                    onResolved: function() {
                        callback(onResolved);
                    },
                    onRejected: function() {
                        callback(onRejected);
                    },
                });
            }     
        });
    }

    // 添加 catch 方法
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    // resolve、reject、all、race方法不属于实例方法，所以不需要添加到原型对象中
    // 是类的方法，所以用static关键字修饰
    // 添加 resolve 方法
    static resolve(value) {
        // 返回一个成功/失败的Promise对象
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(v => {
                    resolve(v);
                }, r => {
                    reject(r);
                })
            }
            else {
                resolve(value);
            }
        });
    }

    // 添加 reject 方法
    static reject(reason) {
        // 返回一个成功/失败的Promise对象
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }

    // 添加 all 方法
    static all(promises) {
        return new Promise((resolve, reject) => {
            let arr = []; // 用来保存所有成功的结果
            // 都成功了，才成功
            // 有一个失败了，就失败
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    // 将当前成功的结果存储到数组中
                    arr[i] = v;
                    // 成功时才会走这里，所以此处得知对象的状态是成功 
                    // 但是不知道是哪一个对象成功了
                    // 所以需要判断是否所有的对象都成功了
                    if (i === promises.length - 1) {
                        // 修改状态
                        resolve(arr);
                    }
                }, r => {
                    reject(r);
                });
            }
        });
    }

    // 添加 race 方法
    static all(promises) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    // 修改状态为成功 （只要有一个成功了，就直接修改为成功了）
                    resolve(v);
                }, r => { 
                    // 修改状态为失败（只要有一个失败了，就直接修改为失败了）
                    reject(r);
                });
            }
        });
    }
}
/*
 * @Author: isboyjc
 * @Date: 2020-02-18 16:31:25
 * @LastEditors: isboyjc
 * @LastEditTime: 2020-03-01 02:16:17
 * @Description: 消息监听回调
 */
const {Message} = require("wechaty")
// node-request请求模块包
const request = require("request")
// 请求参数解码
const urlencode = require("urlencode")
// 获取issue最后一题
const github = require("../github/index")
// 配置文件
const config = require("./config")
// 机器人名字
const name = config.name
// 管理群组列表
const roomList = config.room.roomList

// 消息监听回调
module.exports = bot => {
    return async function onMessage(msg) {
        console.log('msg的内容是：')
        console.log(msg)
        // 判断消息来自自己，直接return
        if (msg.self()) return

        console.log("=============================")
        console.log(`msg : ${msg}`)
        console.log(
            `from: ${msg.from() ? msg.from().name() : null}: ${
                msg.from() ? msg.from().id : null
            }`
        )
        console.log(`to: ${msg.to()}`)
        console.log(`text: ${msg.text()}`)
        console.log(`isRoom: ${msg.room()}`)
        console.log("=============================")

        // 判断此消息类型是否为文本
        if (msg.type() === Message.Type.Text) {
            // 判断消息类型来自群聊
            if (msg.room()) {
                // 获取群聊
                const room = await msg.room()

                // 收到消息，提到自己
                if (await msg.mentionSelf()) {
                    console.log(`%c '群ID'`, 'font-size: 16px; font-weight: bold;color:green', room.id);
                    console.log(`msg.from()`, msg.from());
                    // 获取提到自己的名字
                    let self = await msg.to()
                    self = "@" + self.name()
                    // 获取消息内容，拿到整个消息文本，去掉 @+名字
                    let sendText = msg.text().replace(self, "")

                    // 请求机器人接口回复
                    let res = await requestRobot(sendText)

                    // 返回消息，并@来自人
                    room.say(res, msg.from())
                    return
                }

                // 收到消息，没有提到自己  忽略
            } else {
                // 回复信息是关键字 “加群”
                if (await isAddRoom(msg)) return

                // 回复信息是所管理的群聊名
                if (await isRoomName(bot, msg)) return
                // 来一题，进行考一考的你基础能力
                if (await examination(msg)) return
                // 请求机器人聊天接口
                let res = await requestRobot(msg.text())
                // 返回聊天接口内容
                await msg.say(res)
            }
        } else {
            console.log("消息不是文本！")
        }
    }
}

/**
 * @description 回复信息是关键字 “加群” 处理函数
 * @param {Object} msg 消息对象
 * @return {Promise} true-是 false-不是
 */
async function isAddRoom(msg) {
    // 关键字 加群 处理
    if (msg.text() === "加群") {
        let roomListName = Object.keys(roomList)
        let info = `🎉🎉🎉🎉🎉🎉\n小哥哥，当前群有${roomListName.length}个，\n回复群序号，即可进群。\n😜😜😜😜😜😜\n\n`
        roomListName.map((v, i) => {
            // info += "【" + v + "】" + "\n"
            // info += `【${i}】${v}` + "\n"
            info += `${v}  请回复：${i}` + "   \n"
        })
        msg.say(info)
        return true
    }
    return false
}

/**
 * @description 回复信息是关键字 “加群” 处理函数
 * @param {Object} msg 消息对象
 * @return {Promise} true-是 false-不是
 */
async function examination(msg) {
    // 关键字 加群 处理
    if (msg.text() === "考考我") {
        let getAllIssue = await github.getAllIssue()
        // 获取下标，进行随机发题
        let index = Math.floor(Math.random() * getAllIssue.length + 1)
        let info = `${getAllIssue[index - 1].title}` + "\n\n" + `${getAllIssue[index - 1].html_url}`
        msg.say(info)
        return true
    }
    return false
}

/**
 * @description 回复信息是所管理的群聊名 处理函数
 * @param {Object} bot 实例对象
 * @param {Object} msg 消息对象
 * @return {Promise} true-是群聊 false-不是群聊
 */
async function isRoomName(bot, msg) {
    // 通过群聊id获取到该群聊实例
    let roomNameList = Object.values(roomList)
    // const room = await bot.Room.find({ id: roomList[msg.text()] })
    // 回复信息为管理的群聊名
    try {
        let index = Number(msg.text())
        console.log(index)
        console.log(typeof index === 'number')
        console.log(!isNaN(index))
        console.log(JSON.stringify(roomNameList))
        console.log(roomNameList[index])
        if (typeof index === 'number' && !isNaN(index) && roomNameList[index]) {
            const room = await bot.Room.find({id: roomNameList[index]})
            // 判断是否在房间中 在-提示并结束
            if (await room.has(msg.from())) {
                await msg.say("您已经在房间中了")
                return true
            }
            // 发送群邀请
            await room.add(msg.from())
            await msg.say("已发送群邀请")
            return true
        }
    } catch (e) {
        console.log(e)
        return false
    }
    return false
}

/**
 * @description 机器人请求接口 处理函数
 * @param {String} info 发送文字
 * @return {Promise} 相应内容
 */
function requestRobot(info) {
    return new Promise((resolve, reject) => {
        let url = `https://open.drea.cc/bbsapi/chat/get?keyWord=${urlencode(info)}`
        request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let res = JSON.parse(body)
                if (res.isSuccess) {
                    let send = res.data.reply
                    // 免费的接口，所以需要把机器人名字替换成为自己设置的机器人名字
                    send = send.replace(/Smile/g, name)
                    resolve(send)
                } else {
                    if (res.code === 1010) {
                        resolve("没事别老艾特我，我还以为爱情来了")
                    } else {
                        resolve("你在说什么，我听不懂")
                    }
                }
            } else {
                resolve("你在说什么，我脑子有点短路诶！")
            }
        })
    })
}

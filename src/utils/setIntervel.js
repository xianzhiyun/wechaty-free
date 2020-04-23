// 周一----周五： 6:50 AM 提醒对方起床， 9：30 PM提醒对方回宿舍
 intervalTask = (callback) => {
    setInterval(() => {
        let date = new Date();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds()
        let localTimeString = `${hour}:${minute}:${second}`;
        console.log(localTimeString)
        if(~localTimeString.indexOf('20:00:00')){
            callback()
        }
    },1000);
}
module.exports  = {
    intervalTask
}

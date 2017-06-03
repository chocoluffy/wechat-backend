var request = require("request");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var wwdcSchema = new Schema({
    content: {
        type: String,
        required: true
    }
})
mongoose.connect("mongodb://utzhushou:ada23333@ds019836.mlab.com:19836/utzhushou")
// var URL_OF_LIBRARY_API = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0\u0026amp;num=-1\u0026amp;q=http://www.feed43.com/2343747281410148.xml";

wwdcSchema.statics.findRecentOne = function(cb, id) {
  // return this.findOne({_id: { $ne: id }}, cb);
  return this.find({_id: { $ne: id }}, cb).limit(1).sort({$natural:-1})
};

wwdcSchema.statics.findRecentTen = function(cb) {
  return this.find({}, cb).limit(10).sort({$natural:-1})
};

wwdcSchema.statics.findAll = function(cb) {
  return this.find({}, cb);
};

var comment = mongoose.model('wwdc', wwdcSchema);

exports.wwdc = function(query, callback) {
    if (query.search(/wwdc/i) == 0) {

        if (query.length === 4) {
            comment.findRecentTen((err, data) => {
                if (err) {
                    console.log(err);
                    return callback("呃、服务器出问题了，我们好像听不清你在说什么。\n等会再试试吧，ADA的技术人员马上睡醒了~")
                } else {
                    var response = "正在给你呈现最近的" + data.length + "条回复！\n\n"
                    data.forEach(line => response += (line.content + '\n\n'))
                    response += "\n==========\n请继续多多回复！(ง๑ •̀_•́)ง"
                    return callback(response);
                }
            })
        } else {
            var newComment = new comment({
                content: query.replace(/wwdc/i, "").trim(" ")
            });

            newComment.save((err, com) => {
                if (err) {
                    console.log(err);
                    return callback("呃、服务器出问题了，我们好像听不清你在说什么。\n等会再试试吧，ADA的技术人员马上睡醒了~")
                } else {
                    comment.findRecentOne((err, data) => {
                        if (err) {
                            console.log(err);
                            return callback("呃、服务器出问题了，我们好像听不清你在说什么。\n等会再试试吧，ADA的技术人员马上睡醒了~")
                        } else {
                            var response = "你的回复我确实听到了！\n(o゜▽゜)o☆\n最近的一条发言是\n\n『" + data[0].content +"』\n\n==========\n直接回复wwdc可以查看最新的10条哟"
                            return callback(response);
                        }
                    }, newComment._id)
                }
            })
        }
    } else {
        return callback("不行的哦~\nwwdc四个字母不放在最前面的话，我们是不会收集到你的吐槽~\n\n==========\n秘技·直接回复wwdc可以查看最近10条吐槽哟\n(o゜▽゜)o☆")
    }
}

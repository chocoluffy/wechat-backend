var request = require("request");
var Slack = require('node-slack'); // Redirect all users query to slackbot, to see searching trends.

exports.chat = function(query, callback) {
    /*
      Either cases, redirect user's query to slackbot channel.
     */
    var slack = new Slack("https://hooks.slack.com/services/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");
    var leading_info = "[From UT助手 chatbot]: ";

    var input = query.split(/\s+/).join(''); 
    // console.log(input);

    request.post('http://airloft.org/chat/', {form:{query: input, auth: 'yushunzhe'}}, function (err, res, body) {
    	callback(JSON.parse(body)["response"].trim());
        extra_info = JSON.parse(body)["response"].trim();
    	slack.send({
        	text: leading_info + input + " [INFO]: " + extra_info
    	});
    });
};

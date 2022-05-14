const moment = require("moment");

//this function just formats a message, to it looks good in chat
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;

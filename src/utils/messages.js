//import the moment module to get a "moment in time"
const moment = require("moment");

//function to format a message, takes the username and text
function formatMessage(username, text) {
  //return an object with username, message, and time as a moment
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

//export the formatter
module.exports = formatMessage;

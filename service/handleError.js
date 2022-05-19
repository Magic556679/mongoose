const headers = require('./headers');
const handleError = (res, err) => {
  res.writeHead(400, headers);
  let message = '';
  if (err) {
    message = err.message;
  } else {
    message = "欄位輸入錯誤，或無此ID";
  }
  res.write(JSON.stringify({
    "status": "false",
    message
  }))
  res.end();
}
module.exports = handleError;
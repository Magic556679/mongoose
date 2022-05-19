
const routes = require('./routes/index')
require('./connections')

const app = async (req, res) => {
	routes(req, res);
};

module.exports = app;
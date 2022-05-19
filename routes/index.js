const httpControllers = require('../controllers/http');
const postsControllers = require('../controllers/posts');


const routes = async (req, res) => {
	// 解構 req 可以不用 req.url 重復寫
	const { url, method } = req;

  let body = "";
	req.on('data', chunk => {
		body += chunk
	});
	if(url === '/posts' && method == 'GET'){
		postsControllers.getPosts(req, res);
	} else if(url ==='/posts' && method =='POST'){
		req.on('end', () => postsControllers.createdPosts({req, res, body}))
	} else if(url ==='/posts' && method =='DELETE'){
		postsControllers.deleteAllPosts({req, res});
	} else if(url.startsWith('/posts/') && method =='DELETE'){
		req.on('end', () => postsControllers.deleteByIdPosts({req, res}));
	} else if(url.startsWith('/posts/') && method =='PATCH'){
		req.on('end', () => postsControllers.patchPosts({req,res, body}));
	} else if(url ==='/posts' && method =='OPTIONS'){
		httpControllers.cors(req, res);
	} else {
		httpControllers.notFound(req, res);
	}
}

module.exports = routes
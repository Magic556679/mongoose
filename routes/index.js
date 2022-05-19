const Posts = require('../models/posts');
const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const httpControllers = require('../controllers/http')

const routes = async (req, res) => {
  let body = "";
	req.on('data', chunk => {
		body += chunk
	});
	if(req.url === '/posts' && req.method == 'GET'){
		const posts = await Posts.find();
		handleSuccess(res, posts);
	} else if(req.url ==='/posts' && req.method =='POST'){
		req.on('end', async() => {
			try {
				const data = JSON.parse(body)
				console.log(data)
				if(data.content){
					const newPosts = await Posts.create({
							name: data.name,
							content: data.content,
							tags: data.tags,
							type: data.type
					});
					handleSuccess(res, newPosts);
				} else {
					handleError(res);
				}
			}catch(error){
				handleError(res, error)
			}
		})
	} else if(req.url ==='/posts' && req.method =='DELETE'){
		const posts = await Posts.deleteMany({})
		const allPosts = await Posts.find();
		handleSuccess(res, allPosts);
	} else if(req.url.startsWith('/posts/') && req.method =='DELETE'){
		req.on('end', async() => {
			try {
				const id = req.url.split('/').pop();
				await Posts.findByIdAndDelete(id)
				const posts = await Posts.find();
				handleSuccess(res, posts);
			} catch (error) {
				handleError(error);
			}
		})

	} else if(req.url.startsWith('/posts/') && req.method =='PATCH'){
		req.on('end', async() => {
			try {
				const id = req.url.split('/').pop();
				const findId = await Posts.find({'_id': id})
				const data = JSON.parse(body)
				await Posts.findByIdAndUpdate(findId, {"name": data.name})
				const posts = await Posts.find({})
				handleSuccess(res, posts);
			} catch (error) {
				handleError(error);
			}
		});
	} else if(req.url ==='/posts' && req.method =='OPTIONS'){
		httpControllers.cors(req, res);
	} else {
		httpControllers.notFound(req, res);
	}
}

module.exports = routes
const http = require('http');
const Posts = require('./models/posts');
const headers = require('./headers');
const handleSuccess = require('./handleSuccess');
const handleError = require('./handleError')
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path:'./config.env'});
console.log(process.env.PORT);

const DB = process.env.DATABASE.replace(
	'<password>',
	process.env.DATABASE_PASSWORD
)

// mongoDB 雲端
mongoose.connect(DB)
	.then(()=>{
		console.log('資料庫連線成功')
	})
	.catch((error)=>{
		console.log(error);
	});

const requestListener = async (req, res) => {
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
		res.writeHead(200, headers)
		res.end();
	} else {
		res.writeHead(404, headers)
		res.write(JSON.stringify({
			'status': 'false',
			'message': '欄位輸入錯誤，或無此ID',
		}))
		res.end();
	}
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
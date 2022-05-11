const http = require('http');
const Room = require('./models/room');
const Posts = require('./models/posts');
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
	})
	const headers = {
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
		'Content-Type': 'application/json'
	};
	if(req.url === '/posts' && req.method == 'GET'){
		// const rooms = await Room.find();
		const posts = await Posts.find();
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': 'success',
			posts
		}))
		res.end();
	} else if(req.url ==='/posts' && req.method =='POST'){
		req.on('end', async() => {
			try {
				const data = JSON.parse(body)
				// const newRoom = await Room.create(
				// 	{
				// 		name: data.name,
				// 		price: data.price,
				// 		rating: data.rating
				// 	}
				// )
				console.log(data)
				const newPosts = await Posts.create(
					{
            name: data.name,
            content: data.content,
            tags: data.tags,
            type: data.type
					}
				)
				// const posts = await Posts.find({})
				res.writeHead(200,headers)
				res.write(JSON.stringify({
					'status': 'success',
					'data': newPosts
				}))
				res.end();
			}catch(error){
				res.writeHead(400, headers)
				res.write(JSON.stringify({
					'status': 'false',
					'message': '欄位輸入錯誤，或無此ID',
					'error': error
				}))
				res.end();
			}
		})
	} else if(req.url ==='/posts' && req.method =='DELETE'){
		// const rooms = await Room.deleteMany({})
		const posts = await Posts.deleteMany({})
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': '刪除成功',
			// rooms: []
			posts: []
		}))
		res.end();
	} else if(req.url.startsWith('/posts/') && req.method =='DELETE'){
		const id = req.url.split('/').pop();
		await Posts.findByIdAndDelete(id)
		const posts = await Posts.find();
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': '刪除單筆成功',
			posts: posts
		}))
		res.end();
	} else if(req.url.startsWith('/posts/') && req.method =='PATCH'){
		const id = req.url.split('/').pop();
		const findId = await Posts.find({'_id': id})
		const data = JSON.parse(body)
		await Posts.findByIdAndUpdate(findId, {"name": data.name})
		const posts = await Posts.find({})
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': '編輯單筆成功',
			posts: posts
		}))
		res.end();
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
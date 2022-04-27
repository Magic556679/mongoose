const http = require('http');
const Room = require('./models/room');
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
		const rooms = await Room.find();
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': 'success',
			rooms
		}))
		res.end();
	} else if(req.url ==='/posts' && req.method =='POST'){
		req.on('end', async() => {
			try {
				const data = JSON.parse(body)
				// 第二種寫法
				const newRoom = await Room.create(
					{
						name: data.name,
						price: data.price,
						rating: data.rating
					}
				)
				const rooms = await Room.find({})
				res.writeHead(200,headers)
				res.write(JSON.stringify({
					'status': 'success',
					rooms: rooms
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
		const rooms = await Room.deleteMany({})
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': '刪除成功',
			rooms: []
		}))
		res.end();
	} else if(req.url.startsWith('/posts/') && req.method =='DELETE'){
		const id = req.url.split('/').pop();
		// const index = rooms.findIndex(item => item.id == id)
		await Room.findByIdAndDelete(id)
		const rooms = await Room.find();
		// rooms.splice(index, 1)
		// console.log(index);
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': '刪除單筆成功',
			rooms: rooms
		}))
		res.end();
	} else if(req.url.startsWith('/posts/') && req.method =='PATCH'){
		const id = req.url.split('/').pop();
		const findId = await Room.find({'_id': id})
		const data = JSON.parse(body)
		await Room.findByIdAndUpdate(findId, {"name": data.name})
		const rooms = await Room.find({})
		res.writeHead(200, headers)
		res.write(JSON.stringify({
			'status': '編輯單筆成功',
			rooms: rooms
		}))
		res.end();
	} else if(req.url ==='/posts' && req.method =='OPTIONS'){
		res.writeHead(200, headers)
		res.end();
	} else {
		res.writeHead(400, headers)
		res.write(JSON.stringify({
			'status': 'false',
			'message': '欄位輸入錯誤，或無此ID',
			'error': error
		}))
		res.end();
	}
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
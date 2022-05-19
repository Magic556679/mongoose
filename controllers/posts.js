const Posts = require('../models/posts');
const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');

const posts = {
  async getPosts(req, res) {
    const allPosts = await Posts.find();
		handleSuccess(res, allPosts);
    res.end();
  },
  async createdPosts({req, res, body}) {
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
  },
  async deleteAllPosts({req ,res}){
    const posts = await Posts.deleteMany({})
		const allPosts = await Posts.find();
		handleSuccess(res, allPosts);
  },
  async deleteByIdPosts({req, res}) {
    try {
				const id = req.url.split('/').pop();
				await Posts.findByIdAndDelete(id)
				const posts = await Posts.find();
				handleSuccess(res, posts);
		} catch (error) {
				handleError(error);
		}
  },
  async patchPosts({req, res, body}) {
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
  }
};

module.exports = posts;

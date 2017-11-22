const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Goods = require('../models/goods')

// 线上部署
let env = process.env.NODE_ENV || 'development'
let dbUrl = 'mongodb://mymall_root:chtyy@127.0.0.1:17171/mymall'

// if (env === 'development') {
//     dbUrl = 'mongodb://localhost/mymall'
// }

// DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated,
// plug in your own promise library instead:
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise
// 'mongodb://username:password@host:port/database?options...'
// DeprecationWarning: `open()` is deprecated in mongoose >= 4.11.0
// 4.11.0 后需要使用 openUri 或 { useMongoClient: true }进行连接
// http://mongoosejs.com/docs/connections.html#use-mongo-client
mongoose.connection.openUri(dbUrl)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function (callback) {
    console.log('connection success')
})

// 商品查询
router.get('/get', function (req, res, next) {
    let page = parseInt(req.query.page)
    let pageSize = parseInt(req.query.pageSize)
    let priceLevel = req.query.priceLevel
    let sort = parseInt(req.query.sort)

    let skip = (page - 1) * pageSize
    let params = {}
    let priceStart
    let priceEnd
    if (priceLevel !== 'all') {
        switch (priceLevel) {
            case '0':
                priceStart = 0
                priceEnd = 1000
                break
            case '1':
                priceStart = 1000
                priceEnd = 2000
                break
            case '2':
                priceStart = 2000
                priceEnd = 3000
                break
            case '3':
                priceStart = 3000
                priceEnd = 10000
                break
        }
        params = {
            salePrice: {
                $gt: priceStart,
                $lte: priceEnd
            }
        }
    }
    Goods.find(params).skip(skip).limit(pageSize)
        .sort({
            salePrice: sort
        })
        .exec(function (err, data) {
            if (err) {
                return res.json({
                    status: '-1',
                    msg: err.message
                })
            } else if (data) {
                res.json({
                    status: '0',
                    msg: '获取商品信息成功',
                    result: {
                        count: data.length,
                        list: data
                    }
                })
            }
        })
})

module.exports = router
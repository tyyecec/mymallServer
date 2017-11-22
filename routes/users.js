const express = require('express')
const router = express.Router()
const User = require('./../models/users')
const Goods = require('../models/goods')
require('./../util/util')

// -1 --> 系统程序err  0 --> 用户操作成功  1 --> 用户操作失败

// 用户登录
router.post('/login', function (req, res, next) {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    }
    User.findOne(param, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.cookie('_id', data._id, {
                path: '/',
                maxAge: 1000 * 60 * 60
            })
            res.cookie('userName', data.userName, {
                path: '/',
                maxAge: 1000 * 60 * 60
            })
            res.json({
                status: '0',
                msg: '登录成功',
                result: {
                    userName: data.userName
                }
            })
        } else {
            res.json({
                status: '1',
                msg: '账户/密码错误，登录失败'
            })
        }
    })
})

// 检查是否已存在该用户名
router.get('/checkUserName', function (req, res, next) {
    let param = {
        userName: req.query.userName
    }
    User.findOne(param, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.json({
                status: '0',
                msg: '该用户名已存在',
                result: ''
            })
        } else {
            res.json({
                status: '1',
                msg: '该用户名可注册',
                result: ''
            })
        }
    })
})

// 用户注册
router.post('/register', function (req, res, next) {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    }
    User.create(param, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.json({
                status: '0',
                msg: '注册成功',
                result: ''
            })
        }
    })
})

// 用户登出
router.post('/logout', function (req, res, next) {
    res.cookie('_id', '', {
        path: '/',
        maxAge: -1
    })
    res.cookie('userName', '', {
        path: '/',
        maxAge: -1
    })
    res.json({
        status: '0',
        msg: '',
        result: ''
    })
})

// 用户登录拦截
router.get('/checkLogin', function (req, res, next) {
    if (req.cookies._id) {
        res.json({
            status: '0',
            msg: '已登录',
            result: {
                userName: req.cookies.userName
            }
        })
    } else {
        res.json({
            status: '1',
            msg: '未登录',
            result: ''
        })
    }
})

// 添加购物车
router.post('/addCart', function (req, res, next) {
    let _id = req.cookies._id
    User.findById(_id, function (err, userData) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (userData) {
            let productId = req.body.productId
            // 判断购物车是否已存在该商品
            let isExistProduct = false
            userData.cartList.forEach(function (item) {
                if (item.productId === productId) {
                    item.productNum++
                        isExistProduct = true
                }
            })
            if (isExistProduct) {
                userData.save(function (err1, doc1) {
                    if (err1) {
                        return res.json({
                            status: '-1',
                            msg: err1.message
                        })
                    } else if (doc1) {
                        res.json({
                            status: '0',
                            msg: '添加商品到购物车成功',
                            result: ''
                        })
                    }
                })
            } else {
                Goods.findOne({
                    productId: productId
                }, function (err2, goodData) {
                    if (err2) {
                        return res.json({
                            status: '-1',
                            msg: err2.message
                        })
                    } else if (goodData) {
                        goodData.productNum = 1
                        goodData.checked = 1
                        userData.cartList.push(goodData)
                        userData.save(function (err3, doc3) {
                            if (err3) {
                                return res.json({
                                    status: '-1',
                                    msg: err3.message
                                })
                            } else if (doc3) {
                                res.json({
                                    status: '0',
                                    msg: '添加商品到购物车成功',
                                    result: ''
                                })
                            }
                        })
                    }
                })
            }
        }
    })
})

// 查询购物车商品
router.get('/cartList', function (req, res, next) {
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.json({
                status: '0',
                msg: '',
                result: {
                    cartList: data.cartList
                }
            })
        }
    })
})

// 删除购物车商品
router.post('/cartDel', function (req, res, next) {
    let param = {
        _id: req.cookies._id
    }
    User.update(param, {
        $pull: {
            cartList: {
                productId: req.body.delProductId
            }
        }
    }, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.json({
                status: '0',
                msg: '删除该商品成功',
                result: ''
            })
        }
    })
})

// 修改购物车商品数量 / 是否选中购物车商品
router.post('/cartEdit', function (req, res, next) {
    let param = {
        _id: req.cookies._id,
        'cartList.productId': req.body.productId
    }
    User.update(param, {
        'cartList.$.productNum': req.body.productNum,
        'cartList.$.checked': req.body.checked
    }, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.json({
                status: '0',
                msg: '修改商品数量成功',
                result: ''
            })
        }
    })
})

// 查询购物车商品数量
router.get('/getCartCount', function (req, res, next) {
    if (!req.cookies) {
        return
    }
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            let getCartCount = 0
            data.cartList.forEach(item => {
                getCartCount++
            })
            res.json({
                status: '0',
                msg: '查询购物车商品数量成功',
                result: {
                    getCartCount
                }
            })
        }
    })
})

// checked 全选/全不选 购物车商品
router.post('/checkedAll', function (req, res, next) {
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            let checkedAll = req.body.checkedAll
            data.cartList.forEach(item => {
                item.checked = checkedAll
            })
            data.save(function (err2, data2) {
                if (err2) {
                    return res.json({
                        status: '-1',
                        msg: err2.message
                    })
                } else if (data2) {
                    res.json({
                        status: '0',
                        msg: '全选 / 全不选 成功',
                        result: ''
                    })
                }
            })
        }
    })
})

// 查询地址信息
router.get('/addressList', function (req, res, next) {
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            let list = []
            data.addressList.forEach(item => {
                if (item.isDefault === '0') {
                    list.unshift(item)
                } else {
                    list.push(item)
                }
            })
            res.json({
                status: '0',
                msg: '',
                result: {
                    addressList: list
                }
            })
        }
    })
})

// 设置默认地址
router.post('/setDefaultAddress', function (req, res, next) {
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            let addressId = req.body.addressId
            data.addressList.forEach(item => {
                if (addressId === item.addressId) {
                    item.isDefault = '0'
                } else {
                    item.isDefault = '1'
                }
            })
            data.save(function (err2, data2) {
                if (err2) {
                    return res.json({
                        status: '-1',
                        msg: err2.message
                    })
                } else if (data2) {
                    res.json({
                        status: '0',
                        msg: '设置默认地址成功',
                        result: ''
                    })
                }
            })
        }
    })
})

// 删除地址
router.post('/addressDel', function (req, res, next) {
    let param = {
        _id: req.cookies._id
    }
    User.update(param, {
        $pull: {
            addressList: {
                addressId: req.body.delAddressId
            }
        }
    }, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            res.json({
                status: '0',
                msg: '删除该地址成功',
                result: ''
            })
        }
    })
})

// 添加地址
router.post('/addressAdd', function (req, res, next) {
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            let addressId = 10000
            let addressList = data.addressList
            let isDefault = '0'
            if (addressList.length > 0) {
                addressId = parseInt(addressList[addressList.length - 1].addressId) + 1
                isDefault = '1'
            }
            let addressInfo = {
                addressId,
                userName: req.body.userName,
                streetName: req.body.streetName,
                tel: req.body.tel,
                isDefault
            }
            addressList.push(addressInfo)
            data.save(function (err2, data2) {
                if (err2) {
                    return res.json({
                        status: '-1',
                        msg: err2.message
                    })
                } else if (data2) {
                    res.json({
                        status: '0',
                        msg: '添加地址成功',
                        result: ''
                    })
                }
            })
        }
    })
})

// 创建订单
router.post('/payMent', function (req, res, next) {
    let _id = req.cookies._id
    User.findById(_id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            // 生成订单
            let addressId = req.body.addressId
            let orderTotal = req.body.orderTotal
            let addressInfo = ''
            let goodsList = []
            data.addressList.forEach(item => {
                if (item.addressId === addressId) {
                    addressInfo = item
                }
            })
            data.cartList.forEach(item => {
                if (item.checked === '1') {
                    goodsList.push(item)
                }
            })
            let userId = _id.replace(/[^0-9]/ig, "").substr(0, 3);
            let r1 = Math.floor(Math.random() * 10)
            let r2 = Math.floor(Math.random() * 10)
            let sysDate = new Date().Format('yyyyMMddhhmmss')
            let orderId = r1 + sysDate + r2 + userId
            let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
            let order = {
                orderId,
                orderTotal,
                addressInfo,
                goodsList,
                orderStatus: '1',
                createDate
            }
            data.orderList.push(order)
            // 去掉购物车中已生成订单的商品
            let newcartList = []
            data.cartList.forEach(item => {
                if (item.checked === '0') {
                    newcartList.push(item)
                }
            })
            data.cartList = newcartList
            data.save(function (err2, data2) {
                if (err2) {
                    return res.json({
                        status: '-1',
                        msg: err2.message
                    })
                } else if (data2) {
                    res.json({
                        status: '0',
                        msg: '创建订单成功',
                        result: {
                            orderId: order.orderId,
                            orderTotal: order.orderTotal
                        }
                    })
                }
            })
        }
    })
})

// 根据orderId查询订单信息
router.get('/getOrderById', function (req, res, next) {
    User.findById(req.cookies._id, function (err, data) {
        if (err) {
            return res.json({
                status: '-1',
                msg: err.message
            })
        } else if (data) {
            let orderId = req.query.orderId
            let orderDetail = {}
            data.orderList.forEach(item => {
                if (item.orderId === orderId) {
                    orderDetail = item
                }
            })
            if (orderDetail.orderId) {
                res.json({
                    status: '0',
                    msg: '根据orderId查询订单详情成功',
                    result: {
                        orderDetail
                    }
                })
            } else {
                res.json({
                    status: '1',
                    msg: '无此orderId的订单',
                    result: ''
                })
            }
        }
    })
})

module.exports = router
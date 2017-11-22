const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userName: String,
    userPwd: String,
    orderList: [{
        orderId: String,
        orderTotal: String,
        addressInfo: Object,
        goodsList: Array,
        orderStatus: String,
        createDate: String
    }],
    cartList: [{
        productId: String,
        productName: String,
        salePrice: String,
        productImage: String,
        productNum: String,
        // 1 -> 选中，0 -> 未选中
        checked: String
    }],
    addressList: [{
        addressId: String,
        userName: String,
        streetName: String,
        tel: String,
        // 0 -> 默认地址，1 -> 非默认地址
        isDefault: String
    }]
})

module.exports = mongoose.model('User', userSchema)
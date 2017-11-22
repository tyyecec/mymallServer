const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productId: String,
    productName: String,
    salePrice: Number,
    productImage: String,
    productNum: String,
    checked: String
})

// mongoose会自动查找Good+s的表名，不分大小写
// mongoose.model('Good', productSchema, '如表名不是goods则在此处添加表名')
module.exports = mongoose.model('Good', productSchema)
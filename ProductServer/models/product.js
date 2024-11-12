const mongoose=require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    image: String,
    sold: { type: Boolean, default: false },
    dateOfSale: Date
  });

module.exports = mongoose.model('Product', productSchema);
const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

router.get('/',productController.getProducts);
router.get('/by-month/:month',productController.getProductByMonth);
router.get('/statistics/:month',productController.getSataticsOfMonth);
router.get('/bar-chart/:month',productController.getBarChartDetails);
router.get('/pie-chart/:month',productController.getPieChartDetails);
router.get('/combined-data/:month',productController.getCombineDetails);

module.exports=router;
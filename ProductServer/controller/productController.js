
const Product=require('../models/product');

exports.getProducts= async(req,res)=>{
    try {
        const products = await Product.find(); 
        res.status(200).json(products); 
      } catch (error) {
        console.error('Error fetching products:', error);  
        res.status(500).json({ error: 'Failed to fetch products' });
      }
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

exports.getProductByMonth=async (req, res) => {
    const monthInput = req.params.month;
    const monthIndex = monthNames.indexOf(monthInput);
  
    if (monthIndex === -1) {
      return res.status(400).json({ error: 'Invalid month input. Please provide a valid month name.' });
    }
  
    try {
      const products = await Product.find({
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] } 
      });
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products by month:', error);
      res.status(500).json({ error: 'Failed to fetch products by month' });
    }
  };

exports.getSataticsOfMonth=async(req,res)=>{
    const monthInput = req.params.month;
    const monthIndex = monthNames.indexOf(monthInput);

    if (monthIndex === -1) {
        return res.status(400).json({ error: 'Invalid month input. Please provide a valid month name.' });
    }

    try {
       
        const statistics = await Product.aggregate([
        
        {
            $match: {
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }
            }
        },
        
        {
            $group: {
            _id: "$sold",
            totalSaleAmount: { $sum: "$price" },
            totalItems: { $sum: 1 }
            }
        }
        ]);

        
        const soldData = statistics.find(stat => stat._id === true) || { totalSaleAmount: 0, totalItems: 0 };
        const notSoldData = statistics.find(stat => stat._id === false) || { totalItems: 0 };

        res.status(200).json({
        month: monthInput,
        totalSaleAmount: soldData.totalSaleAmount,
        totalSoldItems: soldData.totalItems,
        totalNotSoldItems: notSoldData.totalItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getBarChartDetails = async (req, res) => {
  const monthInput = req.params.month;
  const monthIndex = monthNames.indexOf(monthInput);

  if (monthIndex === -1) {
      return res.status(400).json({ error: 'Invalid month input. Please provide a valid month name.' });
  }

  try {
      
      const priceRangeData = await Product.aggregate([
          
          {
              $match: {
                  $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }
              }
          },
          
          {
              $bucket: {
                  groupBy: "$price", 
                  boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901], 
                  default: "901-above", 
                  output: { count: { $sum: 1 } } 
              }
          },

          
          {
              $project: {
                  _id: 0,
                  range: {
                      $switch: {
                          branches: [
                              { case: { $eq: ["$_id", 0] }, then: "0-100" },
                              { case: { $eq: ["$_id", 101] }, then: "101-200" },
                              { case: { $eq: ["$_id", 201] }, then: "201-300" },
                              { case: { $eq: ["$_id", 301] }, then: "301-400" },
                              { case: { $eq: ["$_id", 401] }, then: "401-500" },
                              { case: { $eq: ["$_id", 501] }, then: "501-600" },
                              { case: { $eq: ["$_id", 601] }, then: "601-700" },
                              { case: { $eq: ["$_id", 701] }, then: "701-800" },
                              { case: { $eq: ["$_id", 801] }, then: "801-900" },
                              { case: { $eq: ["$_id", "901-above"] }, then: "901+" }
                          ],
                          default: "Unknown"
                      }
                  },
                  count: 1
              }
          }
      ]);

      res.status(200).json(priceRangeData);
  } catch (error) {
      console.error('Error fetching bar chart data:', error);
      res.status(500).json({ error: 'Failed to fetch bar chart data' });
  }
};


exports.getPieChartDetails=async(req,res)=>{
    const monthInput = req.params.month;
    const monthIndex = monthNames.indexOf(monthInput);

    
    if (monthIndex === -1) {
        return res.status(400).json({ error: 'Invalid month input. Please provide a valid month name.' });
    }

    try {
        
        const categoryData = await Product.aggregate([
        
        {
            $match: {
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }
            }
        },
        
        {
            $group: {
            _id: "$category",
            itemCount: { $sum: 1 } 
            }
        }
        ]);

        res.status(200).json(categoryData);
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
};

exports.getCombineDetails=async(req,res)=>{
    const monthInput = req.params.month;
  const monthIndex = monthNames.indexOf(monthInput);

  
  if (monthIndex === -1) {
    return res.status(400).json({ error: 'Invalid month input. Please provide a valid month name.' });
  }

  try {
    
    const statisticsData = await Product.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }
        }
      },
      {
        $facet: {
          totalSalesAmount: [
            { $match: { sold: true } },
            { $group: { _id: null, totalAmount: { $sum: "$price" } } }
          ],
          totalSoldItems: [
            { $match: { sold: true } },
            { $count: "totalSoldItems" }
          ],
          totalNotSoldItems: [
            { $match: { sold: false } },
            { $count: "totalNotSoldItems" }
          ]
        }
      },
      {
        $project: {
          totalSalesAmount: { $arrayElemAt: ["$totalSalesAmount.totalAmount", 0] },
          totalSoldItems: { $arrayElemAt: ["$totalSoldItems.totalSoldItems", 0] },
          totalNotSoldItems: { $arrayElemAt: ["$totalNotSoldItems.totalNotSoldItems", 0] }
        }
      }
    ]);

    
    const barChartData = await Product.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }
        }
      },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
          default: "901-above",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    
    const pieChartData = await Product.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }
        }
      },
      {
        $group: {
          _id: "$category",
          itemCount: { $sum: 1 }
        }
      }
    ]);

    
    const combinedData = {
      statistics: statisticsData[0] || {
        totalSalesAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
      },
      barChart: barChartData,
      pieChart: pieChartData
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
};
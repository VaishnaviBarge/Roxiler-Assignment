import React, { useState, useEffect, useRef } from 'react';
import { getProductsByMonth, getStatistics, getPieChartData, getBarChartData } from './services/apiService';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [month, setMonth] = useState('March');
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProductsByMonth(month);
        setProducts(productsData);
        
        const statsData = await getStatistics(month);
        setStatistics(statsData);
        
        const pieChartData = await getPieChartData(month);
        setPieData(pieChartData);

        const barChartData = await getBarChartData(month);
        setBarData(barChartData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [month]);

  
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm)
  );

  
  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  
  const pieChartDataFormatted = {
    labels: pieData.map(item => item._id),
    datasets: [
      {
        data: pieData.map(item => item.itemCount),
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
        hoverBackgroundColor: ['#ff5e5e', '#4c9eff', '#8e4cf5', '#ffb24e'],
      },
    ],
  };

  
  const barChartDataFormatted = {
    labels: barData.map(item => item.range), 
    datasets: [
      {
        label: 'Item Count',
        data: barData.map(item => item.count), 
        backgroundColor: '#4bc0c0',
        borderColor: '#36a2eb',
        borderWidth: 1,
      },
    ],
  };

  
  const generatePDF = () => {
    const doc = new jsPDF();

    
    doc.setFontSize(18);
    doc.text(`Sales Report for ${month}`, 20, 20);

    
    doc.setFontSize(14);
    doc.text(`Total Sales Amount: $${statistics.totalSaleAmount}`, 20, 30);
    doc.text(`Total Sold Items: ${statistics.totalSoldItems}`, 20, 40);
    doc.text(`Total Unsold Items: ${statistics.totalNotSoldItems}`, 20, 50);

    
    html2canvas(pieChartRef.current, {
      scale: 10, 
      width: pieChartRef.current.offsetWidth,
      height: pieChartRef.current.offsetHeight,
      logging: false,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      doc.addImage(imgData, 'PNG', 20, 60, 170, 90); 

      
      html2canvas(barChartRef.current, {
        scale: 10, 
        width: barChartRef.current.offsetWidth,
        height: barChartRef.current.offsetHeight,
        logging: false,
      }).then((canvas) => {
        const barChartImgData = canvas.toDataURL('image/png');
        
        doc.addImage(barChartImgData, 'PNG', 20, 160, 170, 90); 

        
        doc.save(`Sales_Report_${month}.pdf`);
      });
    });
  };

  return (
    <div>
      {/* Search bar and Month Selector */}
      <div className="d-flex justify-content-between mb-4">
        <input
          type="text"
          className="form-control w-50 m-5"
          placeholder="Search Products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="form-select w-auto m-5"
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((monthName) => (
            <option key={monthName} value={monthName}>{monthName}</option>
          ))}
        </select>
      </div>

      {/* Table to display products */}
      <div className="table-responsive m-5">
        <table className="table table-striped table-bordered ">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Description</th>
              <th>Category</th>
              <th>Image</th>
              <th>Sold</th>
              <th>Date of Sale</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.title}</td>
                <td>${product.price}</td>
                <td>{product.description || 'N/A'}</td>
                <td>{product.category || 'N/A'}</td>
                <td>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="img-fluid"
                      style={{ width: '200px', height: 'auto' }}
                    />
                  ) : (
                    'No image'
                  )}
                </td>
                <td>{product.sold ? 'Sold' : 'Available'}</td>
                <td>{product.dateOfSale ? new Date(product.dateOfSale).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />

      {/* Statistics Display */}
      {statistics && (
        <div className="mt-4 p-3 border rounded bg-light mx-auto mb-5" style={{ maxWidth: '700px' }}>
          <h4 className="text-center">Statistics for {month}</h4>
          <p>Total Sales: ${statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Unsold Items: {statistics.totalNotSoldItems}</p>
        </div>
      )}

      
      {/* Pie Chart */}
      <div className="container mt-5">
        <h5 className="text-center mb-4">Graphical Representation of Transactions </h5>
        <div className="row">
            <div className="col-md-6">
            <h5 className="text-center">Sales Distribution by Category</h5>
            <div className="chart-container" ref={pieChartRef}>
                <Pie data={pieChartDataFormatted} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
            </div>
            </div>
            
            <div className="col-md-6">
            <h5 className="text-center">Sales by Item Rate</h5>
            <div className="chart-container" ref={barChartRef}>
                <Bar data={barChartDataFormatted} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
            </div>
            </div>
        </div>
        </div>

        {/* Generate PDF Button */}
      <div className="text-center mb-5">
        <button className="btn btn-primary" onClick={generatePDF}>Generate PDF Report</button>
      </div>

    </div>
  );
};

// Pagination Component
function Pagination({ currentPage, totalPages, paginate }) {
  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className="page-item">
          <button
            className="page-link"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        <li className="page-item disabled">
          <span className="page-link">Page {currentPage}</span>
        </li>
        <li className="page-item">
          <button
            className="page-link"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Dashboard;

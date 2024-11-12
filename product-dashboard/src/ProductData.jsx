// ProductTable.jsx
import React, { useEffect, useState } from 'react';
import { getProducts } from './services/apiService';

function ProductTable() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle month selection
  const handleMonthSelect = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Filter products based on search term and selected month
  const filteredProducts = products.filter(product => {
    return (
      (product.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedMonth ? new Date(product.dateOfSale).getMonth() === parseInt(selectedMonth) : true)
    );
  });

  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      {/* Fixed Navbar with Search and Month Dropdown */}
      <div className="d-flex justify-content-between mb-4  w-100 bg-light p-3" >
        {/* Search Bar */}
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search Products"
          value={searchTerm}
          onChange={handleSearch}
        />

        {/* Select Month Dropdown */}
        <select
          className="form-select w-25"
          value={selectedMonth}
          onChange={handleMonthSelect}
        >
          <option value="">Select Month</option>
          {/* Generating months dynamically */}
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-responsive">
      <table className="table table-striped p-5 table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Description</th>
            <th>Category</th>
            <th>Image</th>
            <th>Sold</th>
            <th style={{width: '120px'}}>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product._id}>
              <td>{product.title}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
              <td>{product.category}</td>
              <td>
                {product.image ? (
                  <img src={product.image} alt={product.title} style={{ width: '80px' }} />
                ) : (
                  'No image'
                )}
              </td>
              <td>{product.sold ? 'Yes' : 'No'}</td>
              <td>{product.dateOfSale ? new Date(product.dateOfSale).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </div>
  );
}

export default ProductTable;

// Pagination Component
function Pagination({ currentPage, totalPages, paginate }) {
  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className="page-item m-2">
          <button
            className="page-link p-2"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        <li className="page-item m-2 disabled">
          <span className="page-link p-2">Page No. {currentPage}</span>
        </li>
        <li className="page-item m-2">
          <button
            className="page-link p-2"
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

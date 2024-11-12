import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Import Link for routing
import ProductData from './ProductData';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light position-fixed fixed-top w-100">
        <div className="container-fluid">
          
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex flex-row">
              {/* Use Link components for routing */}
              <li className="nav-item fw-bold">
                <Link className="nav-link active px-3" aria-current="page" to="/product-data">
                  Product Data
                </Link>
              </li>
              <li className="nav-item fw-bold">
                <Link className="nav-link active px-3" aria-current="page" to="/dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          
        </div>
      </nav>

      {/* Main Content */}
      <div className=" mt-5 pt-4">
        {/* Define Routes */}
        <Routes>
          <Route path="/product-data" element={<ProductData />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

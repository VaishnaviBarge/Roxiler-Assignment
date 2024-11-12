const API_URL = 'http://localhost:8000/api/products'; 

// Function to fetch all products
export const getProducts = async () => {
  const response = await fetch(`${API_URL}/`);
  const data = await response.json();
  return data;
};

// Function to fetch products by month
export const getProductsByMonth = async (month) => {
  const response = await fetch(`${API_URL}/by-month/${month}`);
  const data = await response.json();
  return data;
};

// Function to fetch statistics for a specific month
export const getStatistics = async (month) => {
  const response = await fetch(`${API_URL}/statistics/${month}`);
  const data = await response.json();
  return data;
};

// Function to fetch bar chart data
export const getBarChartData = async (month) => {
    const response = await fetch(`${API_URL}/bar-chart/${month}`);
    return response.json();
  };

// Function to fetch pie chart data
export const getPieChartData = async (month) => {
    const response = await fetch(`${API_URL}/pie-chart/${month}`);
    return response.json();
  };

// Function to fetch combined data
export const getCombinedData = async (month) => {
  const response = await fetch(`${API_URL}/combined-data/${month}`);
  const data = await response.json();
  return data;
};
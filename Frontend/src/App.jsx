import  {Route, Routes} from 'react-router-dom'
import './App.css'
import Header from './componets/header/Header'
import Login from './componets/login/Login'
import Register from './componets/register/Register'


import Landing from './componets/landing/Landing'
import Footer from './componets/footer/Footer'
import CustomerDashboard from './componets/customerDashboard/CustomerDashboard'

import BrowseCategories from './pages/CustomerSection/BrowseCategories/BrowseCategories'
import BookListing from './pages/CustomerSection/BookListing/BookListing'
import MyBooks from './pages/CustomerSection/myBooks/MyBooks'
import AdminDashboard from './componets/AdminDashboard/AdminDashboard'
import AddBook from './pages/AdminSection/AddBook/AddBook'
import ManageCatagories from './pages/AdminSection/ManageCatagories/ManageCatagories'
import AdminCategoryBooks from './pages/AdminSection/AdminCategoryBooks/AdminCategoryBooks'
import AddCategory from './pages/AdminSection/AddCategory/AddCategory'
import ManageUsers from './pages/AdminSection/ManageUsers/ManageUsers'
import AddAdmin from './pages/AdminSection/AddAdmin/AddAdmin'

function App() {
  

  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/" element={<Landing />} />
        <Route path="/browse-books" element={<BrowseCategories />} />
        <Route path="/books/:id" element={<BookListing />} />
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-book" element={<AddBook />} />
        <Route path="/admin/categories" element={<ManageCatagories />} />
        <Route
          path="/admin/categories/:id/books"
          element={<AdminCategoryBooks />}
        />
        <Route path="/admin/add-category" element={<AddCategory />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/add-admin" element={<AddAdmin/>}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
// import DoctorPage from './pages/DoctorPage';
// import AdminPage from './pages/AdminPage';
// import UserPage from './pages/UserPage';
import SignupPage from './pages/SignupPage';
// import AppointmentPage from './pages/AppointmentPage';
// import AboutPage from './pages/AboutPage';
// import ContactPage from './pages/ContactPage';

function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/appointmentPage" element={<AppointmentPage />} /> */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

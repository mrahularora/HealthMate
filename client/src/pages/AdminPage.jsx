import Sidebar from '../components/common/Sidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import '../css/adminpage.css';
import '../css/sidebar.css';

const AdminPage = () => {

  return (
    <div className="admin-page">
      <Sidebar />
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;

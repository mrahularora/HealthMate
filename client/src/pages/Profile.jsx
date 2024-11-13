// all profile dynamically loads here for user/admin/doctor
import './../css/profile.css';
import Sidebar from '../components/common/Sidebar';
import UserProfile from '../components/common/Profile';

const Profile = () => {
    return (
    <div className="user-profile-container">
        <Sidebar />
        <UserProfile />
    </div>
  );
};

export default Profile;

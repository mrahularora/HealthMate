import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import '../../css/sidebar.css';
import { getUsers, updateUserRole, deleteUser } from '../../services/adminService'; // Ensure these services are correct

const ManageUsers = () => {
  const [users, setUsers] = useState([]); // Default to an empty array
  const [totalUsers, setTotalUsers] = useState(0); // Track total users
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination
  const [filter, setFilter] = useState(''); // Role filter
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); // Set loading to true
        const response = await getUsers(filter, currentPage, 10); // Assuming 10 users per page
        if (response.users) {
          setUsers(response.users); // Set users
          setTotalUsers(response.totalUsers); // Set total users
          setTotalPages(response.totalPages); // Set total pages
        }
        setLoading(false); // Set loading to false
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // If there's an error, ensure users is set to an empty array
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchUsers(); // Fetch users whenever the filter or page changes
  }, [filter, currentPage]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole); // Call the API to update role
      setUsers(users.map(user => (user._id === userId ? response.user : user))); // Update user in the list
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u._id === userId); // Find the user to be deleted
    if (user && user.role === 'Admin') {
      alert("You cannot delete an Admin user.");
      return; // If user is an Admin, prevent deletion
    }

    try {
      await deleteUser(userId); // Delete user API call
      setUsers(users.filter(user => user._id !== userId)); // Remove deleted user from the list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
    <div className="appointment-details">
       <h2 className="greeting">Manage Users</h2>
      
      {/* Role filter dropdown */}
      <select onChange={(e) => setFilter(e.target.value)} value={filter}>
        <option value="">All Users</option>
        <option value="User">User</option>
        <option value="Doctor">Doctor</option>
        <option value="Admin">Admin</option>
      </select>

      {/* Loading state */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Disable the select dropdown for Admin users */}
                    <select
                      value={user.role}
                      onChange={(e) => {
                        if (user.role !== 'Admin') {
                          handleRoleChange(user._id, e.target.value);
                        }
                      }}
                      disabled={user.role === 'Admin'} // Disable if the role is Admin
                    >
                      <option value="User">User</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {/* Disable delete button for Admin users */}
                    <button onClick={() => handleDelete(user._id)} disabled={user.role === 'Admin'}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div>
          <button 
            onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span> Page {currentPage} of {totalPages} </span>
          <button 
            onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageUsers;

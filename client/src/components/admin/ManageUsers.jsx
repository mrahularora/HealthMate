import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import '../../css/sidebar.css';
import { getUsers, updateUserRole, deleteUser } from '../../services/adminService';
import useAuth from '../../context/useAuth'; // Use the custom hook to access AuthContext
import { Modal } from 'react-bootstrap'; // Import Modal component from React-Bootstrap

const ManageUsers = () => {
  const { user: loggedInUser } = useAuth(); // Get logged-in user details from AuthContext
  const [users, setUsers] = useState([]);
  const [, setTotalUsers] = useState(0); // Remove unused `totalUsers`
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Fetch users with pagination and filtering
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers(filter, currentPage, 10);
        if (response.users) {
          setUsers(response.users);
          setTotalUsers(response.totalUsers);
          setTotalPages(response.totalPages);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter, currentPage, setTotalUsers]);


  // Handle role change (Open the confirmation modal first)
  const handleRoleChange = (userId, currentRole) => {
    if (loggedInUser.id === userId) {
      alert('You cannot change your own role.');
      return;
    }

    // Find the user whose role is being changed
    const userToChange = users.find(user => user._id === userId);
    setUserToChangeRole(userToChange); // Store the user whose role is being changed
    setNewRole(currentRole); // Store the current role
    setShowRoleChangeModal(true); // Show the role change confirmation modal

    // Optimistically update the role in the UI immediately
    setUsers(users.map(user =>
      user._id === userId ? { ...user, role: currentRole } : user
    ));
  };

  // Confirm role change
  const confirmRoleChange = async () => {
    try {
      const response = await updateUserRole(userToChangeRole._id, newRole);
      if (response && response.user) {
        // Role successfully updated in the backend
        // No further UI update needed as it's already done optimistically
      }
      setShowRoleChangeModal(false); // Close the modal
      setUserToChangeRole(null); // Clear user state
      setNewRole(''); // Clear role state
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role.');
      setShowRoleChangeModal(false);
      setUserToChangeRole(null);
    }
  };

  // Handle user deletion (Open the confirmation modal first)
  const handleDelete = (userId) => {
    if (loggedInUser.id === userId) {
      alert('You cannot delete your own account.');
      return;
    }

    const userToDelete = users.find(user => user._id === userId);
    setUserToDelete(userToDelete);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete._id);
      // Optimistically remove the deleted user from the UI
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Cancel role change
  const cancelRoleChange = () => {
    setShowRoleChangeModal(false);
    setUserToChangeRole(null);
    setNewRole('');
    // Revert the role change if the modal is canceled
    setUsers(users.map(user =>
      user._id === userToChangeRole._id ? { ...user, role: userToChangeRole.role } : user
    ));
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="appointment-details">
        <h2 className="greeting">Manage Users</h2>

        {/* Role filter dropdown */}
        <select className="form-select" onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="">All Users</option>
          <option value="User">User</option>
          <option value="Doctor">Doctor</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Display error if any */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {/* Loading and user table */}
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="table mt-3">
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
                users.map(user => {
                  if (!user) return null; // Skip rendering undefined users
                  return (
                    <tr key={user._id}>
                      <td>{user.firstName || 'N/A'} {user.lastName || 'N/A'}</td> {/* Added fallback */}
                      <td>{user.email || 'N/A'}</td>
                      <td>
                        <select
                          className="form-select"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={user.role === 'Admin' || user._id === loggedInUser.id} // Disable for Admins and logged-in user
                        >
                          <option value="User">User</option>
                          <option value="Doctor">Doctor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(user._id)}
                          disabled={user.role === 'Admin' || user._id === loggedInUser.id} // Disable for Admins and logged-in user
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <button
              className="btn btn-primary me-2"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-primary ms-2"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal for Role Change */}
      <Modal show={showRoleChangeModal} onHide={cancelRoleChange}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Role Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to change the role of user <strong>{userToChangeRole?.firstName} {userToChangeRole?.lastName}</strong> to {newRole}?
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={cancelRoleChange}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmRoleChange}>Confirm</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;

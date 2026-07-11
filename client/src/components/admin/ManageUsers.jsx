import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import useAuth from "../../context/useAuth";
import Sidebar from "../../components/common/Sidebar";
import "../../css/sidebar.css";
import "../../css/adminpage.css";
import { deleteUser, getUsers, updateUserRole } from "../../services/adminService";

const roleFilters = [
  { label: "All Users", value: "" },
  { label: "Patients", value: "User" },
  { label: "Doctors", value: "Doctor" },
  { label: "Admins", value: "Admin" },
];

const roleOptions = ["User", "Doctor", "Admin"];

const getFullName = (user) =>
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unnamed user";

const ManageUsers = () => {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUsers(filter, currentPage, 10);

        setUsers(response.users || []);
        setTotalUsers(response.totalUsers || 0);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter, currentPage]);

  const handleFilterChange = (role) => {
    setFilter(role);
    setCurrentPage(1);
  };

  const openRoleChange = (selectedUser, selectedRole) => {
    if (loggedInUser?.id === selectedUser._id) {
      setError("You cannot change your own role.");
      return;
    }

    setUserToChangeRole(selectedUser);
    setNewRole(selectedRole);
    setShowRoleChangeModal(true);
  };

  const confirmRoleChange = async () => {
    if (!userToChangeRole || !newRole) return;

    try {
      setActionLoading(true);
      const updatedUser = await updateUserRole(userToChangeRole._id, newRole);
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userToChangeRole._id ? { ...user, ...updatedUser } : user
        )
      );
      setShowRoleChangeModal(false);
      setUserToChangeRole(null);
      setNewRole("");
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role.");
      setShowRoleChangeModal(false);
      setUserToChangeRole(null);
    } finally {
      setActionLoading(false);
    }
  };

  const openDelete = (selectedUser) => {
    if (loggedInUser?.id === selectedUser._id) {
      setError("You cannot delete your own account.");
      return;
    }

    setUserToDelete(selectedUser);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setActionLoading(true);
      await deleteUser(userToDelete._id);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userToDelete._id)
      );
      setTotalUsers((currentTotal) => Math.max(currentTotal - 1, 0));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const closeRoleChangeModal = () => {
    setShowRoleChangeModal(false);
    setUserToChangeRole(null);
    setNewRole("");
  };

  const selectedFilterLabel =
    roleFilters.find((role) => role.value === filter)?.label || "All Users";

  return (
    <div className="manage-users-page">
      <Sidebar />
      <main className="manage-users">
        <section className="manage-users-hero">
          <div>
            <p className="manage-users-eyebrow">Admin Tools</p>
            <h1>Manage platform users</h1>
            <p>
              Review accounts, adjust roles, and keep user access aligned with
              the way HealthMate is being used.
            </p>
          </div>
          <div className="manage-users-summary">
            <span>{selectedFilterLabel}</span>
            <strong>{loading ? "--" : totalUsers}</strong>
          </div>
        </section>

        {error && (
          <div className="manage-users-alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <section className="manage-users-toolbar">
          <div>
            <p className="manage-users-eyebrow">Directory Filter</p>
            <h2>{selectedFilterLabel}</h2>
          </div>
          <div className="manage-users-filters" aria-label="Filter users by role">
            {roleFilters.map((role) => (
              <button
                type="button"
                key={role.label}
                className={
                  filter === role.value
                    ? "manage-users-filter is-active"
                    : "manage-users-filter"
                }
                onClick={() => handleFilterChange(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>
        </section>

        <section className="manage-users-panel">
          <div className="manage-users-panel__heading">
            <div>
              <p className="manage-users-eyebrow">Users</p>
              <h2>Account Directory</h2>
            </div>
            <span className="manage-users-pill">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="manage-users-loading">
              <span />
              <span />
              <span />
            </div>
          ) : users.length > 0 ? (
            <div className="manage-users-table-wrap">
              <table className="manage-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const protectedUser =
                      user.role === "Admin" || user._id === loggedInUser?.id;

                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="manage-users-person">
                            <span aria-hidden="true">
                              {(user.firstName?.[0] || "U").toUpperCase()}
                            </span>
                            <div>
                              <strong>{getFullName(user)}</strong>
                              <small>{user._id}</small>
                            </div>
                          </div>
                        </td>
                        <td>{user.email || "N/A"}</td>
                        <td>
                          <select
                            className="manage-users-role-select"
                            value={user.role}
                            onChange={(event) =>
                              openRoleChange(user, event.target.value)
                            }
                            disabled={protectedUser}
                          >
                            {roleOptions.map((role) => (
                              <option value={role} key={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="manage-users-delete"
                            onClick={() => openDelete(user)}
                            disabled={protectedUser}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="manage-users-empty">
              <h3>No users found</h3>
              <p>Try another role filter or refresh after new signups.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="manage-users-pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{getFullName(userToDelete)}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="manage-users-modal-button is-secondary"
            onClick={closeDeleteModal}
            type="button"
          >
            Cancel
          </button>
          <button
            className="manage-users-modal-button is-danger"
            onClick={confirmDelete}
            disabled={actionLoading}
            type="button"
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRoleChangeModal} onHide={closeRoleChangeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Role Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Change <strong>{getFullName(userToChangeRole)}</strong> to{" "}
          <strong>{newRole}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="manage-users-modal-button is-secondary"
            onClick={closeRoleChangeModal}
            type="button"
          >
            Cancel
          </button>
          <button
            className="manage-users-modal-button is-primary"
            onClick={confirmRoleChange}
            disabled={actionLoading}
            type="button"
          >
            {actionLoading ? "Saving..." : "Confirm"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;

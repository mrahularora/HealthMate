const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getStats, 
  getDetails,
  getAllContacts,
  getAllAppointmentsByDoctor,
  getAppointmentDetails
} = require('../controllers/AdminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect, authorizeRoles('Admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.get('/details/:type', getDetails);
router.get('/contacts', getAllContacts);
router.get("/appointments", getAllAppointmentsByDoctor);
router.get("/appointments/:id", getAppointmentDetails);

module.exports = router;

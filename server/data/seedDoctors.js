require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Appointment = require("../models/Appointments");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const doctorProfiles = [
  {
    id: "heart-care-ava-shah",
    firstName: "Ava",
    lastName: "Shah",
    email: "ava.shah@healthmate.test",
    gender: "Female",
    specialization: "Cardiology",
    experience: 11,
    imageUrl: "/assets/images/doctors/1.jpg",
    bio: "Focused on preventive heart care, blood pressure management, and long-term cardiac wellness.",
  },
  {
    id: "family-care-noah-patel",
    firstName: "Noah",
    lastName: "Patel",
    email: "noah.patel@healthmate.test",
    gender: "Male",
    specialization: "Family Medicine",
    experience: 8,
    imageUrl: "/assets/images/doctors/2.jpg",
    bio: "Provides everyday primary care, annual checkups, and ongoing support for chronic conditions.",
  },
  {
    id: "skin-care-mia-chen",
    firstName: "Mia",
    lastName: "Chen",
    email: "mia.chen@healthmate.test",
    gender: "Female",
    specialization: "Dermatology",
    experience: 7,
    imageUrl: "/assets/images/doctors/3.jpg",
    bio: "Treats acne, eczema, rashes, and skin health concerns with practical care plans.",
  },
  {
    id: "child-care-ethan-wilson",
    firstName: "Ethan",
    lastName: "Wilson",
    email: "ethan.wilson@healthmate.test",
    gender: "Male",
    specialization: "Pediatrics",
    experience: 10,
    imageUrl: "/assets/images/doctors/4.jpg",
    bio: "Supports children and families through checkups, illness visits, and growth milestones.",
  },
  {
    id: "mind-care-sophia-martin",
    firstName: "Sophia",
    lastName: "Martin",
    email: "sophia.martin@healthmate.test",
    gender: "Female",
    specialization: "Mental Health",
    experience: 9,
    imageUrl: "/assets/images/doctors/5.jpg",
    bio: "Helps patients manage stress, anxiety, sleep concerns, and emotional wellbeing.",
  },
  {
    id: "bone-care-liam-brown",
    firstName: "Liam",
    lastName: "Brown",
    email: "liam.brown@healthmate.test",
    gender: "Male",
    specialization: "Orthopedics",
    experience: 12,
    imageUrl: "/assets/images/doctors/6.jpg",
    bio: "Works with joint pain, sports injuries, mobility concerns, and recovery planning.",
  },
];

const defaultPassword = "Doctor@123";

const toDisplayName = (doctor) => `Dr. ${doctor.firstName} ${doctor.lastName}`;

const getIsoDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

const upcomingWeekdayDates = () => {
  const dates = [];
  let offset = 1;

  while (dates.length < 6) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const day = date.getDay();

    if (day !== 0 && day !== 6) {
      dates.push(getIsoDate(offset));
    }

    offset += 1;
  }

  return dates;
};

const seedDoctorUser = async (doctor) => {
  const existingDoctor = await User.findOne({ email: doctor.email });

  if (existingDoctor) {
    existingDoctor.firstName = doctor.firstName;
    existingDoctor.lastName = doctor.lastName;
    existingDoctor.gender = doctor.gender;
    existingDoctor.role = "Doctor";
    existingDoctor.specialization = doctor.specialization;
    existingDoctor.experience = doctor.experience;
    existingDoctor.bio = doctor.bio;
    existingDoctor.imageUrl = doctor.imageUrl;
    await existingDoctor.save();
    return existingDoctor;
  }

  return User.create({
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    password: defaultPassword,
    gender: doctor.gender,
    role: "Doctor",
    specialization: doctor.specialization,
    experience: doctor.experience,
    bio: doctor.bio,
    imageUrl: doctor.imageUrl,
  });
};

const seedDoctorCard = async (doctor, doctorUser) => {
  await Doctor.findOneAndUpdate(
    { id: doctor.id },
    {
      id: doctor.id,
      name: toDisplayName(doctor),
      specialty: doctor.specialization,
      experience: doctor.experience,
      description: doctor.bio,
      imageUrl: doctor.imageUrl,
      doctorId: doctorUser._id.toString(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const seedAvailability = async (doctorUser) => {
  const slots = [
    { startTime: "09:00", endTime: "09:30", status: "Available", isBooked: false },
    { startTime: "10:00", endTime: "10:30", status: "Available", isBooked: false },
    { startTime: "14:00", endTime: "14:30", status: "Available", isBooked: false },
  ];

  for (const date of upcomingWeekdayDates()) {
    let appointment = await Appointment.findOne({ doctorId: doctorUser._id, date });

    if (!appointment) {
      await Appointment.create({
        doctorId: doctorUser._id,
        date,
        timeSlots: slots,
      });
      continue;
    }

    for (const slot of slots) {
      const exists = appointment.timeSlots.some(
        (existingSlot) =>
          existingSlot.startTime === slot.startTime &&
          existingSlot.endTime === slot.endTime
      );

      if (!exists) {
        appointment.timeSlots.push(slot);
      }
    }

    await appointment.save();
  }
};

const getDoctorNameParts = (name) => {
  const cleanName = name.replace(/^Dr\.\s*/i, "").trim();
  const [firstName, ...lastNameParts] = cleanName.split(/\s+/);

  return {
    firstName: firstName || "HealthMate",
    lastName: lastNameParts.join(" ") || "Doctor",
  };
};

const getDoctorEmail = (name) => {
  const slug = name
    .replace(/^Dr\.\s*/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");

  return `${slug || "doctor"}@healthmate.test`;
};

const getDoctorCardId = (name) =>
  name
    .replace(/^Dr\.\s*/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "healthmate-doctor";

const ensureDoctorCardHasUser = async (doctorCard) => {
  const linkedDoctor = doctorCard.doctorId
    ? await User.findById(doctorCard.doctorId).catch(() => null)
    : null;

  if (linkedDoctor) {
    linkedDoctor.specialization = doctorCard.specialty;
    linkedDoctor.experience = doctorCard.experience;
    linkedDoctor.bio = doctorCard.description;
    linkedDoctor.imageUrl = doctorCard.imageUrl;
    linkedDoctor.role = "Doctor";
    await linkedDoctor.save();
    await seedAvailability(linkedDoctor);
    return;
  }

  const { firstName, lastName } = getDoctorNameParts(doctorCard.name);
  const email = getDoctorEmail(doctorCard.name);
  let doctorUser = await User.findOne({ email });

  if (!doctorUser) {
    doctorUser = await User.create({
      firstName,
      lastName,
      email,
      password: defaultPassword,
      gender: "Not specified",
      role: "Doctor",
      specialization: doctorCard.specialty,
      experience: doctorCard.experience,
      bio: doctorCard.description,
      imageUrl: doctorCard.imageUrl,
    });
  } else {
    doctorUser.firstName = firstName;
    doctorUser.lastName = lastName;
    doctorUser.role = "Doctor";
    doctorUser.specialization = doctorCard.specialty;
    doctorUser.experience = doctorCard.experience;
    doctorUser.bio = doctorCard.description;
    doctorUser.imageUrl = doctorCard.imageUrl;
    await doctorUser.save();
  }

  doctorCard.id = doctorCard.id || getDoctorCardId(doctorCard.name);
  doctorCard.doctorId = doctorUser._id.toString();
  await doctorCard.save();
  await seedAvailability(doctorUser);
};

const repairExistingDoctorCards = async () => {
  const doctorCards = await Doctor.find();

  for (const doctorCard of doctorCards) {
    await ensureDoctorCardHasUser(doctorCard);
  }
};

const seedDoctors = async () => {
  await connectDB();

  for (const doctor of doctorProfiles) {
    const doctorUser = await seedDoctorUser(doctor);
    await seedDoctorCard(doctor, doctorUser);
    await seedAvailability(doctorUser);
  }

  await repairExistingDoctorCards();

  const totalDoctorCards = await Doctor.countDocuments();
  console.log(
    `Seeded ${doctorProfiles.length} doctors, repaired ${totalDoctorCards} doctor cards, and added starter appointment slots.`
  );
  await mongoose.connection.close();
};

seedDoctors().catch(async (error) => {
  console.error("Doctor seed failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});

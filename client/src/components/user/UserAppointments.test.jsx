import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserAppointments from "./UserAppointments";
import {
  cancelAppointment,
  getAppointments,
} from "../../services/appointmentService";

jest.mock("../../services/appointmentService", () => ({
  cancelAppointment: jest.fn(),
  getAppointments: jest.fn(),
}));

jest.mock("../common/Sidebar", () => () => <nav>Patient navigation</nav>);

const appointmentResponse = {
  appointments: [
    {
      _id: "appointment-1",
      date: "2099-08-15T00:00:00.000Z",
      doctorDetails: { name: "Dr. Ada Lovelace" },
      timeSlots: [
        {
          _id: "slot-1",
          startTime: "09:00",
          endTime: "09:30",
          status: "Requested",
          isBooked: true,
        },
        {
          _id: "slot-2",
          startTime: "10:00",
          endTime: "10:30",
          status: "Confirmed",
          isBooked: true,
        },
      ],
    },
    {
      _id: "appointment-2",
      date: "2020-01-10T00:00:00.000Z",
      doctorDetails: { name: "Dr. Grace Hopper" },
      timeSlots: [
        {
          _id: "slot-3",
          startTime: "13:00",
          endTime: "13:30",
          status: "Completed",
          isBooked: true,
        },
      ],
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn(() => true);
});

test("renders every patient slot in the correct section", async () => {
  getAppointments.mockResolvedValue(appointmentResponse);

  render(<UserAppointments />);

  expect(await screen.findAllByText("Dr. Ada Lovelace")).toHaveLength(2);
  expect(screen.getByText("Dr. Grace Hopper")).toBeInTheDocument();
  expect(screen.getByText("Requested")).toBeInTheDocument();
  expect(screen.getByText("Confirmed")).toBeInTheDocument();
  expect(screen.getByText("Completed")).toBeInTheDocument();
});

test("cancels the selected slot and moves it into history", async () => {
  getAppointments.mockResolvedValue(appointmentResponse);
  cancelAppointment.mockResolvedValue({ message: "Cancelled" });

  render(<UserAppointments />);

  const cancelButtons = await screen.findAllByRole("button", {
    name: "Cancel appointment",
  });
  fireEvent.click(cancelButtons[0]);

  await waitFor(() => {
    expect(cancelAppointment).toHaveBeenCalledWith("appointment-1", "slot-1");
  });
  expect(await screen.findByText("Cancelled")).toBeInTheDocument();
});

test("shows empty states when the user has no appointments", async () => {
  getAppointments.mockResolvedValue({ appointments: [] });

  render(<UserAppointments />);

  expect(await screen.findByText("No upcoming appointments")).toBeInTheDocument();
  expect(screen.getByText("No appointment history")).toBeInTheDocument();
});

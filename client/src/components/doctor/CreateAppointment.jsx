import React, { useContext, useMemo, useState } from "react";
import { createAppointmentSlots } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import EditAppointment from "./EditAppointment";

const getDoctorId = (user) => user?.id || user?._id || user?.doctorId;

const getTodayInputValue = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

const formatDisplayDate = (date) => {
  if (!date) return "No date selected";

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const generateTimeSlots = () => {
  const timeSlots = [];

  for (let hour = 7; hour < 17; hour += 1) {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(hour + 1).padStart(2, "0")}:00`;
    timeSlots.push({
      label: `${start} - ${end}`,
      value: `${start}-${end}`,
      period: hour < 12 ? "Morning" : "Afternoon",
    });
  }

  return timeSlots;
};

const parseSlot = (slot) => {
  const [startTime, endTime] = slot.split("-");
  return { startTime, endTime };
};

const countSelectedSlots = (dates) =>
  dates.reduce((total, dateObj) => total + dateObj.timeSlots.length, 0);

const CreateAppointmentComponent = () => {
  const { user } = useContext(AuthContext);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const doctorId = getDoctorId(user);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const selectedSlotCount = countSelectedSlots(dates);
  const selectedDateSlots =
    dates.find((dateObj) => dateObj.date === selectedDate)?.timeSlots || [];

  const groupedSlots = timeSlots.reduce((groups, slot) => {
    groups[slot.period] = groups[slot.period] || [];
    groups[slot.period].push(slot);
    return groups;
  }, {});

  if (user?.role !== "Doctor") {
    return (
      <main className="create-appointment">
        <section className="create-appointment__empty">
          <h1>Create Appointments</h1>
          <p>You do not have permission to create appointment slots.</p>
        </section>
      </main>
    );
  }

  const addSlotsToDate = (date, slotsToAdd) => {
    setDates((currentDates) => {
      const dateIndex = currentDates.findIndex((dateObj) => dateObj.date === date);

      if (dateIndex === -1) {
        return [...currentDates, { date, timeSlots: [...slotsToAdd] }].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
      }

      const updatedDates = [...currentDates];
      const mergedSlots = Array.from(
        new Set([...updatedDates[dateIndex].timeSlots, ...slotsToAdd])
      ).sort();
      updatedDates[dateIndex] = {
        ...updatedDates[dateIndex],
        timeSlots: mergedSlots,
      };

      return updatedDates.sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const addTimeSlot = () => {
    setSuccessMessage("");

    if (!selectedDate || !selectedSlot) {
      setError("Please select both a date and a time slot.");
      return;
    }

    if (selectedDate < getTodayInputValue()) {
      setError("Please choose today or a future date.");
      return;
    }

    if (selectedDateSlots.includes(selectedSlot)) {
      setError("This time slot is already added for the selected date.");
      return;
    }

    addSlotsToDate(selectedDate, [selectedSlot]);
    setError("");
    setSelectedSlot("");
  };

  const addFullDay = () => {
    setSuccessMessage("");

    if (!selectedDate) {
      setError("Please select a date before adding a full day.");
      return;
    }

    addSlotsToDate(
      selectedDate,
      timeSlots.map((slot) => slot.value)
    );
    setError("");
  };

  const clearSelectedDate = () => {
    setDates((currentDates) =>
      currentDates.filter((dateObj) => dateObj.date !== selectedDate)
    );
    setError("");
    setSuccessMessage("");
  };

  const removeTimeSlot = (date, slot) => {
    setDates((currentDates) =>
      currentDates
        .map((dateObj) =>
          dateObj.date === date
            ? {
                ...dateObj,
                timeSlots: dateObj.timeSlots.filter((timeSlot) => timeSlot !== slot),
              }
            : dateObj
        )
        .filter((dateObj) => dateObj.timeSlots.length > 0)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!doctorId) {
      setError("Doctor profile is missing an account ID. Please log in again.");
      return;
    }

    if (selectedSlotCount === 0) {
      setError("Add at least one time slot before publishing availability.");
      return;
    }

    const appointmentData = {
      doctorId,
      appointments: dates.map((dateObj) => ({
        date: dateObj.date,
        timeSlots: dateObj.timeSlots.map((slot) => ({
          ...parseSlot(slot),
          isBooked: false,
        })),
      })),
    };

    setSubmitting(true);
    setError("");

    try {
      await createAppointmentSlots(appointmentData);
      setDates([]);
      setSelectedSlot("");
      setSuccessMessage(`${selectedSlotCount} appointment slots published successfully.`);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      if (err.response?.data?.duplicateSlots) {
        const duplicateMessages = err.response.data.duplicateSlots.map(
          (slot) => `${slot.startTime} - ${slot.endTime}`
        );
        setError(
          `Some selected slots already exist: ${duplicateMessages.join(", ")}. Remove them and try again.`
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Error creating appointment slots. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="create-appointment">
      <section className="create-appointment__hero">
        <div>
          <p className="create-appointment__eyebrow">Doctor schedule</p>
          <h1>Create appointment slots</h1>
          <p>
            Publish availability for upcoming consultation days, review the slots
            you are about to add, and manage open slots from the same workspace.
          </p>
        </div>
        <aside>
          <span>Draft slots</span>
          <strong>{selectedSlotCount}</strong>
          <small>
            {dates.length} {dates.length === 1 ? "day" : "days"} selected
          </small>
        </aside>
      </section>

      {error && <p className="create-appointment__alert is-error">{error}</p>}
      {successMessage && (
        <p className="create-appointment__alert is-success">{successMessage}</p>
      )}

      <form className="create-appointment__workspace" onSubmit={handleSubmit}>
        <section className="create-appointment__builder">
          <div className="create-appointment__section-heading">
            <div>
              <p className="create-appointment__eyebrow">Availability builder</p>
              <h2>Select date and time</h2>
            </div>
            <button onClick={addFullDay} type="button">
              Add full day
            </button>
          </div>

          <div className="create-appointment__fields">
            <label>
              Date
              <input
                min={getTodayInputValue()}
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
              />
            </label>

            <label>
              Time slot
              <select
                onChange={(event) => setSelectedSlot(event.target.value)}
                value={selectedSlot}
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option
                    disabled={selectedDateSlots.includes(time.value)}
                    key={time.value}
                    value={time.value}
                  >
                    {time.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="create-appointment__slot-groups">
            {Object.entries(groupedSlots).map(([period, slots]) => (
              <div key={period}>
                <span>{period}</span>
                <div>
                  {slots.map((slot) => (
                    <button
                      className={
                        selectedDateSlots.includes(slot.value) ? "is-selected" : ""
                      }
                      key={slot.value}
                      onClick={() => {
                        setSelectedSlot(slot.value);
                        addSlotsToDate(selectedDate, [slot.value]);
                        setError("");
                        setSuccessMessage("");
                      }}
                      type="button"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="create-appointment__actions">
            <button onClick={addTimeSlot} type="button">
              Add selected slot
            </button>
            <button
              className="is-secondary"
              disabled={!selectedDateSlots.length}
              onClick={clearSelectedDate}
              type="button"
            >
              Clear selected date
            </button>
          </div>
        </section>

        <aside className="create-appointment__review">
          <div className="create-appointment__section-heading">
            <div>
              <p className="create-appointment__eyebrow">Review</p>
              <h2>Slots to publish</h2>
            </div>
            <span>{selectedSlotCount}</span>
          </div>

          {dates.length > 0 ? (
            <div className="create-appointment__selected-list">
              {dates.map((dateObj) => (
                <article key={dateObj.date}>
                  <div>
                    <strong>{formatDisplayDate(dateObj.date)}</strong>
                    <small>{dateObj.timeSlots.length} slots</small>
                  </div>
                  <ul>
                    {dateObj.timeSlots.map((slot) => (
                      <li key={slot}>
                        <span>{slot.replace("-", " - ")}</span>
                        <button
                          aria-label={`Remove ${slot}`}
                          onClick={() => removeTimeSlot(dateObj.date, slot)}
                          type="button"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <div className="create-appointment__empty">
              <h3>No slots selected</h3>
              <p>Choose a date and add one or more time slots to build your schedule.</p>
            </div>
          )}

          <button
            className="create-appointment__publish"
            disabled={submitting || selectedSlotCount === 0}
            type="submit"
          >
            {submitting ? "Publishing..." : "Publish appointment slots"}
          </button>
        </aside>
      </form>

      <EditAppointment refreshKey={refreshKey} />
    </main>
  );
};

export default CreateAppointmentComponent;

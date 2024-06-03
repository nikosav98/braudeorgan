import React from "react";
import Paper from "@mui/material/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";
import TableCell from "@mui/material/TableCell";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { blue, green, orange, red } from "@mui/material/colors";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import CustomAppointment from "./CustomAppointment"; // Import the custom appointment component

import { appointments as initialAppointments } from "./appointments";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: blue,
  },
  direction: "rtl",
});

const typeToColorMap = {
  lecture: green[500],
  lab: orange[500],
  exercise: red[500],
};

const dayMap = {
  "א": 0,
  "ב": 1,
  "ג": 2,
  "ד": 3,
  "ה": 4,
  "ו": 5,
  "ש": 6,
};

const DayScaleCell = ({ startDate }) => (
  <TableCell style={{width: '100px', borderRight: '0px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
    <span>
      {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(startDate)}
    </span>
  </TableCell>
);

class SchedulerApp extends React.PureComponent {
  constructor(props) {
    super(props);

    const savedData = JSON.parse(localStorage.getItem("scheduleData")) || [];

    this.state = {
      selectedCourse: "",
      selectedLecture: "",
      selectedLectureType: "",
      selectedDayOfWeek: "",
      data: savedData,
      selectedAppointment: null, // State to track the selected appointment
      allowConflicts: false, // State to manage the restriction toggle
      searchInput: "", // State to manage the search input
    };
  }

  handleCourseChange = (event) => {
    this.setState({
      selectedCourse: event.target.value,
      selectedLecture: "",
      selectedLectureType: "",
    });
  };

  handleLectureChange = (event) => {
    const lectureId = event.target.value;
    const lecture = this.getLectureById(lectureId);
    const linkedLecture = lecture ? this.getLectureById(lecture.linkedId) : null;

    const adjustedLecture = lecture ? this.adjustLectureDate(lecture) : null;
    const adjustedLinkedLecture = linkedLecture ? this.adjustLectureDate(linkedLecture) : null;

    const { data, allowConflicts } = this.state;

    if (!allowConflicts) {
      const courseAppointments = data.filter(app => app.title === adjustedLecture.title);
      const existingLecture = courseAppointments.find(app => app.type === 'lecture');
      const existingExercise = courseAppointments.find(app => app.type === 'exercise');
      const existingLab = courseAppointments.find(app => app.type === 'lab');

      if (adjustedLecture.type === 'lecture' && existingLecture ||
          adjustedLecture.type === 'exercise' && existingExercise ||
          adjustedLecture.type === 'lab' && existingLab) {
        alert(`Only one of each type (lecture, exercise, lab) can be chosen at a time for the course ${adjustedLecture.title}.`);
        return;
      }
    }

    this.setState({
      selectedLecture: lectureId,
      selectedLectureType: adjustedLecture.type,
      selectedDayOfWeek: Intl.DateTimeFormat("en-US", { weekday: "short" }).format(adjustedLecture.startDate),
    });

    if (adjustedLecture && !this.isLectureAdded(lectureId)) {
      const newAppointments = [
        {
          id: adjustedLecture.id,
          title: adjustedLecture.title,
          startDate: adjustedLecture.startDate,
          endDate: adjustedLecture.endDate,
          type: adjustedLecture.type,
          location: adjustedLecture.location,
          lecturer: adjustedLecture.lecturer,
          backgroundColor: typeToColorMap[adjustedLecture.type], // Set the background color based on type
        },
      ];

      if (adjustedLinkedLecture && !this.isLectureAdded(linkedLecture.id)) {
        newAppointments.push({
          id: adjustedLinkedLecture.id,
          title: adjustedLinkedLecture.title,
          startDate: adjustedLinkedLecture.startDate,
          endDate: adjustedLinkedLecture.endDate,
          type: adjustedLinkedLecture.type,
          location: adjustedLinkedLecture.location,
          lecturer: adjustedLinkedLecture.lecturer,
          backgroundColor: typeToColorMap[adjustedLinkedLecture.type], // Set the background color based on type
        });
      }

      this.setState(
        (prevState) => ({
          data: [...prevState.data, ...newAppointments],
        }),
        this.saveScheduleToLocalStorage
      );
    }
  };

  handleRemoveAppointment = (appointmentId) => {
    const appointment = this.state.data.find((app) => app.id === appointmentId);
    const linkedAppointmentId = appointment ? appointment.linkedId : null;

    this.setState(
      (prevState) => ({
        data: prevState.data.filter(
          (app) => app.id !== appointmentId && app.id !== linkedAppointmentId
        ),
        selectedAppointment: null, // Reset the selected appointment
      }),
      this.saveScheduleToLocalStorage
    );
  };

  handleAppointmentClick = (appointment) => {
    this.setState({
      selectedAppointment: appointment,
    });
  };

  handleCancelDeletion = () => {
    this.setState({
      selectedAppointment: null,
    });
  };

  handleToggleChange = (event) => {
    this.setState({ allowConflicts: event.target.checked });
  };

  handleSearchChange = (event) => {
    this.setState({ searchInput: event.target.value });
  };

  isLectureAdded = (id) => {
    return this.state.data.some((appointment) => appointment.id === id);
  };

  getLectureById = (id) => {
    return initialAppointments.find((lecture) => lecture.id === id);
  };

  adjustLectureDate = (lecture) => {
    const dayOfWeek = dayMap[lecture.day]; // Map lecture day to the appropriate weekday number
  
    // Get the current date and reset it to the start of the week (Sunday)
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const weekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDay));
  
    // Set the start date to the correct day of the week
    const adjustedStartDate = new Date(weekStartDate);
    adjustedStartDate.setDate(weekStartDate.getDate() + dayOfWeek);
    
    // Extract and set the time from the lecture's start date
    const lectureStartTime = new Date(lecture.startDate);
    adjustedStartDate.setHours(lectureStartTime.getHours(), lectureStartTime.getMinutes(), 0, 0);
  
    // Adjust the end date similarly
    const adjustedEndDate = new Date(adjustedStartDate);
    const lectureEndTime = new Date(lecture.endDate);
    adjustedEndDate.setHours(lectureEndTime.getHours(), lectureEndTime.getMinutes(), 0, 0);

    // Default the type to "lecture" if it is "N/A"
    const lectureType = lecture.type === "N/A" ? "lecture" : lecture.type;
  
    return {
      ...lecture,
      startDate: adjustedStartDate,
      endDate: adjustedEndDate,
      type: lectureType,
    };
  };

  handleExportToExcel = () => {
    const { data } = this.state;

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((appointment) => ({
        TimeSlot: `${this.formatTime(new Date(appointment.startDate))} - ${this.formatTime(new Date(appointment.endDate))}`,
        Type: appointment.type,
        Course: appointment.title,
        Location: appointment.location,
        Lecturer: appointment.lecturer,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scheduled Courses");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileName = "scheduled_courses.xlsx";
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      fileName
    );
  };

  formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  saveScheduleToLocalStorage = () => {
    const { data } = this.state;
    localStorage.setItem("scheduleData", JSON.stringify(data));
  };

  render() {
    const { data, selectedCourse, selectedLecture, selectedLectureType, selectedDayOfWeek, selectedAppointment, allowConflicts, searchInput } = this.state;

    const filteredLectures = initialAppointments.filter(
      (lecture) => lecture.title === selectedCourse
    );

    const filteredCourses = Array.from(
      new Set(initialAppointments
        .map((lecture) => lecture.title))
    ).filter((courseName) => courseName.toLowerCase().includes(searchInput.toLowerCase()));

    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          flexDirection="column"
          height="100vh"
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          <Box className="header-container" display="flex" justifyContent="space-between" alignItems="center" padding={2}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Braude schedule organizer (updated 03/06)
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={allowConflicts}
                  onChange={this.handleToggleChange}
                  name="allowConflicts"
                  color="primary"
                />
              }
              label="הסרת הגבלה על כמות מאותו שיעור"
              style={{ color: 'white' }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" flexGrow={1}>
            <Paper style={{ flexGrow: 1, direction: "rtl" }}>
              <Scheduler data={data}>
                <ViewState currentDate={new Date()} />
                <WeekView
                  startDayHour={8}
                  endDayHour={19}
                  dayScaleCellComponent={DayScaleCell}
                  excludedDays={[6]}
                />
                <Appointments
                  appointmentComponent={(props) => (
                    <CustomAppointment
                      data={props.data}
                      formatTime={this.formatTime}
                      handleRemoveAppointment={this.handleRemoveAppointment}
                      selectedAppointment={selectedAppointment}
                      handleAppointmentClick={this.handleAppointmentClick}
                      handleCancelDeletion={this.handleCancelDeletion}
                      style={{
                      }}
                    />
                  )}
                />
              </Scheduler>
            </Paper>
            <Box
              sx={{
                minWidth: 250,
                marginLeft: 2,
                marginTop: 2,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                padding: 1,
                borderRadius: 0,
              }}
            >
              <TextField
                fullWidth
                label="חיפוש קורס"
                variant="outlined"
                value={searchInput}
                onChange={this.handleSearchChange}
                sx={{ marginBottom: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel id="course-dropdown-label">בחר קורס</InputLabel>
                <Select
                  labelId="course-dropdown-label"
                  id="course-dropdown"
                  value={selectedCourse}
                  onChange={this.handleCourseChange}
                  label="בחר קורס"
                >
                  {filteredCourses.map((courseName, index) => (
                    <MenuItem key={index} value={courseName}>
                      {courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedCourse && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="lecture-dropdown-label">בחר הרצאה</InputLabel>
                  <Select
                    labelId="lecture-dropdown-label"
                    id="lecture-dropdown"
                    value={selectedLecture}
                    onChange={this.handleLectureChange}
                    label="בחר הרצאה"
                  >
                    {filteredLectures.map((lecture) => {
                      const adjustedLecture = this.adjustLectureDate(lecture);
                      return (
                        <MenuItem key={lecture.id} value={lecture.id}>
                          {`${Intl.DateTimeFormat("en-US", {
                            weekday: "short",
                          }).format(adjustedLecture.startDate)}, ${this.formatTime(
                            adjustedLecture.startDate
                          )} - ${this.formatTime(adjustedLecture.endDate)}, ${
                            lecture.type
                          }, ${lecture.lecturer}`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
<FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel id="added-lectures-dropdown-label">הרצאות נבחרות (לחץ למחיקה)</InputLabel>
  <Select
    labelId="added-lectures-dropdown-label"
    id="added-lectures-dropdown"
    value=""
    onChange={(e) => this.handleRemoveAppointment(e.target.value)} // Use the value to remove the appointment
    label="Added Lectures"
    renderValue={(selected) => {
      if (selected.length === 0) {
        return <em>Added Lectures</em>;
      }
      return selected.join(', ');
    }}
  >
    {data.map((appointment) => (
      <MenuItem
        key={appointment.id}
        value={appointment.id}
        style={{
          backgroundColor: typeToColorMap[appointment.type],
          color: theme.palette.getContrastText(typeToColorMap[appointment.type]),
        }}
      >
        {appointment.title} - {appointment.type} ({this.formatTime(new Date(appointment.startDate))} - {this.formatTime(new Date(appointment.endDate))})
      </MenuItem>
    ))}
  </Select>
</FormControl>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleExportToExcel}
                >
                  Export Schedule to Excel
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ backgroundColor: 'var(--footer-bg-color)' }}>
            <Box mt={2} textAlign="center" className="footer-container">
              <Typography variant="body2" className="footer-text">
                This site is not affiliated with Braude College. Made by Niko. Wanna help me out? <span>Buy me a coffee when you see me</span>. <a href="mailto:nikosav98@gmail.com">Report a problem.</a>
              </Typography>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default SchedulerApp;

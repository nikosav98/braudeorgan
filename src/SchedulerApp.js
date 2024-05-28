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
import { blue, green, orange, red } from "@mui/material/colors"; // Import different colors
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
  Button,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Import your appointments data from a file or define it directly in the same file
import { appointments as initialAppointments } from "./appointments";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: blue,
  },
  direction: "rtl", // Set the direction to right-to-left
});

// Map for assigning colors to different types
const typeToColorMap = {
  lecture: green[500],
  lab: orange[500],
  seminar: red[500],
  // Add more types and colors as needed
};

// Map for Hebrew days to Israeli weekdays
const dayMap = {
  "א": 0, // Sunday
  "ב": 1, // Monday
  "ג": 2, // Tuesday
  "ד": 3, // Wednesday
  "ה": 4, // Thursday
  "ו": 5, // Friday
  "ש": 6, // Saturday
};

const DayScaleCell = ({ startDate }) => (
  <TableCell style={{ borderRight: '1px solid rgba(255, 255, 255, 0.12)' }}>
    <span>
      {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(startDate)}
    </span>
  </TableCell>
);

class SchedulerApp extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedCourse: "", // State for the selected course
      selectedLecture: "", // State for the selected lecture
      selectedLectureType: "", // State for the selected lecture type
      selectedDayOfWeek: "", // State for the selected day of the week
      data: [], // Empty array to start with an empty schedule
    };
  }

  handleCourseChange = (event) => {
    this.setState({
      selectedCourse: event.target.value,
      selectedLecture: "", // Reset selected lecture when course changes
      selectedLectureType: "", // Reset selected lecture type when course changes
    });
  };

  handleLectureChange = (event) => {
    const lectureId = event.target.value;
    const lecture = this.getLectureById(lectureId);

    const adjustedLecture = this.adjustLectureDate(lecture);

    this.setState({
      selectedLecture: lectureId,
      selectedLectureType: adjustedLecture.type,
      selectedDayOfWeek: Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        adjustedLecture.startDate
      ),
    });

    if (adjustedLecture && !this.isLectureAdded(lectureId)) {
      const newAppointment = {
        id: adjustedLecture.id,
        title: adjustedLecture.title,
        startDate: adjustedLecture.startDate,
        endDate: adjustedLecture.endDate,
        type: adjustedLecture.type,
        location: adjustedLecture.location,
        lecturer: adjustedLecture.lecturer,
      };
      this.setState((prevState) => ({
        data: [...prevState.data, newAppointment],
      }));
    }
  };

  handleRemoveAppointment = (appointmentId) => {
    this.setState((prevState) => ({
      data: prevState.data.filter(
        (appointment) => appointment.id !== appointmentId
      ),
    }));
  };

  // Function to check if lecture is already added
  isLectureAdded = (id) => {
    return this.state.data.some((appointment) => appointment.id === id);
  };

  // Function to get lecture details by ID
  getLectureById = (id) => {
    return initialAppointments.find((lecture) => lecture.id === id);
  };

  // Function to adjust lecture dates based on the "day" field
  adjustLectureDate = (lecture) => {
    const dayOfWeek = dayMap[lecture.day];

    // Get current week's start date (Sunday)
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const weekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDay));

    // Adjust start and end dates to the correct day of the current week
    const adjustedStartDate = new Date(weekStartDate);
    adjustedStartDate.setDate(weekStartDate.getDate() + dayOfWeek);
    adjustedStartDate.setHours(new Date(lecture.startDate).getHours(), new Date(lecture.startDate).getMinutes());

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(new Date(lecture.endDate).getHours(), new Date(lecture.endDate).getMinutes());

    return {
      ...lecture,
      startDate: adjustedStartDate,
      endDate: adjustedEndDate,
    };
  };

  handleExportToExcel = () => {
    const { data } = this.state;

    // Convert data to Excel format
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

    // Generate a download
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

  // Helper function to format time in 24-hour format
  formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  render() {
    const { data, selectedCourse, selectedLecture, selectedLectureType, selectedDayOfWeek } = this.state;

    // Filter lectures based on selected course
    const filteredLectures = initialAppointments.filter(
      (lecture) => lecture.title === selectedCourse
    );

    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" flexDirection="column" height="100vh">
          <Box display="flex" justifyContent="space-between" flexGrow={1}>
            <Paper style={{ flexGrow: 1, direction: "rtl" }}>
              <Scheduler data={data}>
                <ViewState currentDate={new Date()} />
                <WeekView
                  startDayHour={8}
                  endDayHour={19}
                  dayScaleCellComponent={DayScaleCell}
                  excludedDays={[6]} // Exclude Saturday
                />
                <Appointments
                  appointmentComponent={(props) => (
                    <Appointments.Appointment {...props}>
                      <div
                        style={{
                          textAlign: "center",
                          backgroundColor: typeToColorMap[props.data.type],
                          borderRadius: 8,
                          padding: 10,
                          fontSize: '14px', // Increase font size
                        }}
                      >
                        <div>{props.data.title}</div>
                        <div>{`${this.formatTime(
                          new Date(props.data.startDate)
                        )} - ${this.formatTime(new Date(props.data.endDate))}`}</div>
                        <div>{props.data.type}</div>
                        <div>{props.data.location}</div>
                        <div>{props.data.lecturer}</div>
                        <Tooltip title="Remove">
                          <IconButton
                            onClick={() =>
                              this.handleRemoveAppointment(props.data.id)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </Appointments.Appointment>
                  )}
                />
              </Scheduler>
            </Paper>
            <Box sx={{ minWidth: 200, marginLeft: 2, marginTop: 4, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, padding: 2, borderRadius: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="course-dropdown-label">Select Course</InputLabel>
                <Select
                  labelId="course-dropdown-label"
                  id="course-dropdown"
                  value={selectedCourse}
                  onChange={this.handleCourseChange}
                  label="Select Course"
                >
                  {Array.from(
                    new Set(initialAppointments.map((lecture) => lecture.title))
                  ).map((courseName, index) => (
                    <MenuItem key={index} value={courseName}>
                      {courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedCourse && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="lecture-dropdown-label">Select Lecture</InputLabel>
                  <Select
                    labelId="lecture-dropdown-label"
                    id="lecture-dropdown"
                    value={selectedLecture}
                    onChange={this.handleLectureChange}
                    label="Select Lecture"
                  >
                    {filteredLectures.map((lecture) => {
                      const adjustedLecture = this.adjustLectureDate(lecture);
                      return (
                        <MenuItem key={lecture.id} value={lecture.id}>
                          {`${Intl.DateTimeFormat("en-US", { weekday: "short" }).format(adjustedLecture.startDate)}, ${this.formatTime(adjustedLecture.startDate)} - ${this.formatTime(adjustedLecture.endDate)}, ${lecture.type}, ${lecture.lecturer}`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
              <Box mt={2}>
                {data.map((appointment) => (
                  <Box
                    key={appointment.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 1, padding: 1, marginY: 1 }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        backgroundColor: typeToColorMap[appointment.type],
                        borderRadius: 8,
                        padding: 10,
                        fontSize: '14px', // Increase font size
                      }}
                    >
                      <div>{appointment.title}</div>
                      <div>{`${this.formatTime(
                        new Date(appointment.startDate)
                      )} - ${this.formatTime(new Date(appointment.endDate))}`}</div>
                      <div>{appointment.type}</div>
                      <div>{appointment.location}</div>
                      <div>{appointment.lecturer}</div>
                      <Tooltip title="Remove">
                        <IconButton
                          onClick={() =>
                            this.handleRemoveAppointment(appointment.id)
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Box>
                ))}
              </Box>
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
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              This website is not affiliated with Ort Braude in any way. Made by Niko
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default SchedulerApp;

import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";
import TableCell from "@mui/material/TableCell";
import { useMediaQuery } from '@mui/material';
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
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import html2canvas from 'html2canvas';
import CustomAppointment from "./CustomAppointment"; // Import the custom appointment component
import { saveAs } from 'file-saver';

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
  <TableCell style={{ width: '100px', borderRight: '0px solid rgba(255, 255, 255, 0.12)', height: '100%' }}>
    <span>
      {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(startDate)}
    </span>
  </TableCell>
);

const SchedulerApp = () => {
  const savedData = JSON.parse(localStorage.getItem("scheduleData")) || [];
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLecture, setSelectedLecture] = useState("");
  const [selectedLectureType, setSelectedLectureType] = useState("");
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");
  const [data, setData] = useState(savedData);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [allowConflicts, setAllowConflicts] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    localStorage.setItem("scheduleData", JSON.stringify(data));
  }, [data]);

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
    setSelectedLecture("");
    setSelectedLectureType("");
  };

  const handleLectureChange = (event) => {
    const lectureId = event.target.value;
    const lecture = getLectureById(lectureId);
    const linkedLecture = lecture ? getLectureById(lecture.linkedId) : null;

    const adjustedLecture = lecture ? adjustLectureDate(lecture) : null;
    const adjustedLinkedLecture = linkedLecture ? adjustLectureDate(linkedLecture) : null;

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

    setSelectedLecture(lectureId);
    setSelectedLectureType(adjustedLecture.type);
    setSelectedDayOfWeek(Intl.DateTimeFormat("en-US", { weekday: "short" }).format(adjustedLecture.startDate));

    if (adjustedLecture && !isLectureAdded(lectureId)) {
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

      if (adjustedLinkedLecture && !isLectureAdded(linkedLecture.id)) {
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

      setData((prevData) => [...prevData, ...newAppointments]);
    }
  };

  const handleRemoveAppointment = (appointmentId) => {
    const appointment = data.find((app) => app.id === appointmentId);
    const linkedAppointmentId = appointment ? appointment.linkedId : null;

    setData((prevData) => prevData.filter(
      (app) => app.id !== appointmentId && app.id !== linkedAppointmentId
    ));
    setSelectedAppointment(null);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCancelDeletion = () => {
    setSelectedAppointment(null);
  };

  const handleToggleChange = (event) => {
    setAllowConflicts(event.target.checked);
  };

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const isLectureAdded = (id) => {
    return data.some((appointment) => appointment.id === id);
  };

  const getLectureById = (id) => {
    return initialAppointments.find((lecture) => lecture.id === id);
  };

  const adjustLectureDate = (lecture) => {
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

  const handleExportToImage = () => {
    const input = document.getElementById('scheduler-container'); // The container you want to capture

    html2canvas(input, { scale: 2 }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, 'scheduled_courses.png');
      });
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const filteredLectures = initialAppointments.filter(
    (lecture) => lecture.title === selectedCourse
  );

  const filteredCourses = Array.from(
    new Set(initialAppointments.map((lecture) => lecture.title))
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
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.5rem' }}>
            Braude schedule organizer (updated 03/06)
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={allowConflicts}
                onChange={handleToggleChange}
                name="allowConflicts"
                color="primary"
              />
            }
            label={isMobile ? "Remove restrictions" : "הסרת הגבלה על כמות מאותו שיעור"}
            style={{ color: 'white' }}
          />
        </Box>
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" flexGrow={1}>
          <Paper id="scheduler-container" style={{ flexGrow: 1, direction: "rtl" }}>
            <Scheduler data={data}>
              <ViewState currentDate={new Date()} />
              <WeekView
                startDayHour={8}
                endDayHour={19} // Ensure the endDayHour includes lectures after 4:30 PM
                dayScaleCellComponent={DayScaleCell}
                timeTableCellComponent={(props) => (
                  <WeekView.TimeTableCell {...props} style={{ height: '50px' }} /> // Adjust the cell height as needed
                )}
                excludedDays={[6]}
              />
              <Appointments
                appointmentComponent={(props) => (
                  <CustomAppointment
                    data={props.data}
                    formatTime={formatTime}
                    handleRemoveAppointment={handleRemoveAppointment}
                    selectedAppointment={selectedAppointment}
                    handleAppointmentClick={handleAppointmentClick}
                    handleCancelDeletion={handleCancelDeletion}
                    style={{
                    }}
                  />
                )}
              />
            </Scheduler>
          </Paper>
          <Box
            sx={{
              minWidth: isMobile ? '100%' : 250,
              marginLeft: isMobile ? 0 : 2,
              marginTop: isMobile ? 2 : 0,
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
              onChange={handleSearchChange}
              sx={{ marginBottom: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel id="course-dropdown-label">בחר קורס</InputLabel>
              <Select
                labelId="course-dropdown-label"
                id="course-dropdown"
                value={selectedCourse}
                onChange={handleCourseChange}
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
                  onChange={handleLectureChange}
                  label="בחר הרצאה"
                >
                  {filteredLectures.map((lecture) => {
                    const adjustedLecture = adjustLectureDate(lecture);
                    return (
                      <MenuItem key={lecture.id} value={lecture.id}>
                        {`${Intl.DateTimeFormat("en-US", {
                          weekday: "short",
                        }).format(adjustedLecture.startDate)}, ${formatTime(
                          adjustedLecture.startDate
                        )} - ${formatTime(adjustedLecture.endDate)}, ${
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
                onChange={(e) => handleRemoveAppointment(e.target.value)} // Use the value to remove the appointment
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
                    {appointment.title} - {appointment.type} ({formatTime(new Date(appointment.startDate))} - {formatTime(new Date(appointment.endDate))})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth={isMobile}
                onClick={handleExportToImage}
              >
                Export Schedule to Image
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

export default SchedulerApp;

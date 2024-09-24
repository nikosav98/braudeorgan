import React, { useState, useEffect } from "react";
import Header from './Header';
import SearchCourse from './SearchCourse';
import LectureSelector from './LectureSelector';
import AddedLectures from './AddedLectures';
import Footer from './Footer';
import Paper from "@mui/material/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import { Scheduler, WeekView, Appointments } from "@devexpress/dx-react-scheduler-material-ui";
import { Box, Button, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { blue, green, orange, red } from "@mui/material/colors";
import html2canvas from "html2canvas";
import CustomAppointment from "./CustomAppointment";
import CustomAppointmentForm from './CustomAppointmentForm';
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';
import { appointments as initialAppointments } from "./appointments";
import DayScaleCell from './DayScaleCell';

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
  palette: {
    mode: "dark",
    primary: blue,
  },
  direction: 'rtl',
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

const SplashScreen = ({ onDismiss }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, // Ensure it's on top of everything
    }}
  >
    <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
      Not currently compatible with mobile phones
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={onDismiss}
    >
      Dismiss
    </Button>
  </Box>
);

const SchedulerApp = () => {
  const savedData = JSON.parse(localStorage.getItem("scheduleData")) || [];
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLecture, setSelectedLecture] = useState("");
  const [data, setData] = useState(savedData);
  const [addedCourses, setAddedCourses] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [allowConflicts, setAllowConflicts] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCustomAppointmentFormOpen, setIsCustomAppointmentFormOpen] = useState(false);
  const [hoveredAppointments, setHoveredAppointments] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSplashDismissed, setIsSplashDismissed] = useState(false);

  useEffect(() => {
    const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent) && window.innerWidth <= 767;
    setIsMobile(isMobileDevice);
  }, []);

  useEffect(() => {
    localStorage.setItem("scheduleData", JSON.stringify(data));
  }, [data]);

  const handleDeleteAllAppointments = () => {
    setData([]);
    localStorage.removeItem("scheduleData"); // Clear the local storage as well if needed
  };

  

  const handleOpenCustomAppointmentForm = () => {
    setIsCustomAppointmentFormOpen(true);
  };

  const handleCloseCustomAppointmentForm = () => {
    setIsCustomAppointmentFormOpen(false);
  };

  const handleSaveCustomAppointment = (newAppointment) => {
    setData((prevData) => [...prevData, newAppointment]);
  };

  const handleDismissSplash = () => {
    setIsSplashDismissed(true);
  };

  const handleCourseChange = (courseName) => {
    setSelectedCourse(courseName);
    setSelectedLecture("");
    setSearchInput(courseName); 
    setIsDropdownOpen(false);
  };

  const handleColorChange = (appointmentId, color) => {
    setData((prevData) =>
      prevData.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, backgroundColor: color } : appointment
      )
    );
  };

  const handleLectureChange = (value) => {
    const lectureIds = value.split(','); // Split the value to get individual IDs
    const lectures = lectureIds.map((id) => getLectureById(id));
    const adjustedLectures = lectures.map(adjustLectureDate);

    if (!allowConflicts) {
      const hasConflict = adjustedLectures.some((adjustedLecture) => {
        const courseAppointments = data.filter((app) => app.title === adjustedLecture.title);
        return courseAppointments.some((app) => app.type === adjustedLecture.type);
      });

      if (hasConflict) {
        alert(`לא ניתן לבחור יותר מאחד מאותו סוג של שיעור.`);
        return;
      }
    }

    const newAppointments = adjustedLectures.map((adjustedLecture) => ({
      id: adjustedLecture.id,
      title: adjustedLecture.title,
      startDate: adjustedLecture.startDate,
      endDate: adjustedLecture.endDate,
      type: adjustedLecture.type,
      location: adjustedLecture.location,
      lecturer: adjustedLecture.lecturer,
      backgroundColor: typeToColorMap[adjustedLecture.type],
    }));

    setData((prevData) => [...prevData, ...newAppointments]);
    setHoveredAppointments([]);  // Clear the hovered appointments when one is selected

    setAddedCourses((prevAddedCourses) => [
      ...prevAddedCourses,
      ...newAppointments.map((appointment) => appointment.title),
    ]);
  };

  const handleRemoveAppointment = (appointmentId) => {
    const appointment = data.find((app) => app.id === appointmentId);
    const linkedAppointmentId = appointment ? appointment.linkedId : null;

    setData((prevData) => 
      prevData.filter((app) => app.id !== appointmentId && app.id !== linkedAppointmentId)
    );
    setSelectedAppointment(null);

    setAddedCourses((prevAddedCourses) => 
      prevAddedCourses.filter((course) => course !== appointment.title)
    );
  };
  
  const handleHoverLecture = (lectures) => {
    setHoveredAppointments(lectures || []);
  };
  
  // Add this to the mouse leave event of the dropdown
  const handleMouseLeaveDropdown = () => {
    setHoveredAppointments([]);
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
    setAnchorEl(event.currentTarget);
    setIsDropdownOpen(true);
  };

  const isLectureAdded = (id) => {
    return data.some((appointment) => appointment.id === id);
  };

  const getLectureById = (id) => {
    return initialAppointments.find((lecture) => lecture.id === id);
  };

  const adjustLectureDate = (lecture) => {
    const dayOfWeek = dayMap[lecture.day];
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const weekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDay));
    const adjustedStartDate = new Date(weekStartDate);
    adjustedStartDate.setDate(weekStartDate.getDate() + dayOfWeek);
    const lectureStartTime = new Date(lecture.startDate);
    adjustedStartDate.setHours(lectureStartTime.getHours(), lectureStartTime.getMinutes(), 0, 0);
    const adjustedEndDate = new Date(adjustedStartDate);
    const lectureEndTime = new Date(lecture.endDate);
    adjustedEndDate.setHours(lectureEndTime.getHours(), lectureEndTime.getMinutes(), 0, 0);

    return {
      ...lecture,
      startDate: adjustedStartDate,
      endDate: adjustedEndDate,
      type: lecture.type,
    };
  };

  const handleExportToImage = () => {
    const input = document.getElementById("scheduler-container"); 

    html2canvas(input, { scale: 2 }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, "scheduled_courses.png");
      });
    });
  };

  const handleExportToExcel = () => {
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    const formattedData = data.map((appointment) => {
      const startDate = new Date(appointment.startDate);
      const endDate = new Date(appointment.endDate);
  
      if (isNaN(startDate) || isNaN(endDate)) {
        console.error("Invalid date detected:", appointment);
        return null;
      }
  
      return {
        "Course Title": appointment.title,
        "Day of Week": Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(startDate),
        "Start Time": startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        "End Time": endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        "Location": appointment.location,
        "Lecturer": appointment.lecturer,
        "Type": appointment.type,
        "Notes": appointment.customText || "",
        dayOfWeekIndex: startDate.getDay(),
        startTime: startDate.getTime(),
      };
    }).filter(appointment => appointment !== null);
  
    if (formattedData.length === 0) {
      console.error("No valid data to export.");
      return;
    }
  
    const sortedData = formattedData.sort((a, b) => {
      if (a.dayOfWeekIndex !== b.dayOfWeekIndex) {
        return a.dayOfWeekIndex - b.dayOfWeekIndex;
      }
      return a.startTime - b.startTime;
    });
  
    sortedData.forEach(item => {
      delete item.dayOfWeekIndex;
      delete item.startTime;
    });
  
    const worksheet = XLSX.utils.json_to_sheet(sortedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
  
    const worksheetStyle = {
      "!cols": [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }],
      "!rows": [{ hpt: 20 }],
    };
    worksheet["!cols"] = worksheetStyle["!cols"];
    worksheet["!rows"] = worksheetStyle["!rows"];
  
    XLSX.writeFile(workbook, "schedule.xlsx");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const filteredLectures = (initialAppointments || []).filter((lecture) => lecture.title === selectedCourse);

  const filteredCourses = Array.from(new Set(initialAppointments.map((lecture) => lecture.title))).filter((courseName) =>
    courseName.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleClickAway = () => {
    setIsDropdownOpen(false);
  };

  if (isMobile && !isSplashDismissed) {
    return <SplashScreen onDismiss={handleDismissSplash} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box  display="flex" flexDirection="column" height="100%" sx={{ backgroundColor: theme.palette.background.default }}>
        <Header allowConflicts={allowConflicts} handleToggleChange={handleToggleChange} />
        <Box display="flex" flexDirection="row" justifyContent="space-between" flexGrow={1}>
          <Paper id="scheduler-container" style={{ flexGrow: 1, direction: 'rtl' }}>
            <Scheduler data={[...data, ...hoveredAppointments]} >
              <ViewState currentDate={new Date()} />
              <WeekView
                startDayHour={8}
                endDayHour={21}
                cellDuration={60}
                dayScaleCellComponent={DayScaleCell}
                timeTableCellComponent={(props) => (
                  <WeekView.TimeTableCell {...props} style={{ height: '50px' }} />
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
                    handleColorChange={handleColorChange}
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
              borderRadius: 0,
              paddingRight: '1px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <SearchCourse
                searchInput={searchInput}
                handleSearchChange={handleSearchChange}
                isDropdownOpen={isDropdownOpen}
                anchorEl={anchorEl}
                handleClickAway={handleClickAway}
                filteredCourses={filteredCourses}
                handleCourseChange={handleCourseChange}
              />
            <LectureSelector
              selectedCourse={selectedCourse}
              selectedLecture={selectedLecture}
              handleLectureChange={handleLectureChange}
              filteredLectures={filteredLectures}
              adjustLectureDate={adjustLectureDate}
              formatTime={formatTime}
              getLectureById={getLectureById}
              onHoverLecture={handleHoverLecture} // Pass the hover handler
              isLectureAdded={isLectureAdded} // Pass the function to check if lecture is added
            />
              <AddedLectures
                data={data}
                handleRemoveAppointment={handleRemoveAppointment}
                typeToColorMap={typeToColorMap}
                theme={theme}
                formatTime={formatTime}
              />
            </Box>
            <Box sx={{ mt: 2, mb: 2, px: 2 }}>
              <Button variant="contained" color="primary" onClick={handleOpenCustomAppointmentForm} sx={{ mb: 2 }}>
                Add Custom Appointment
              </Button>
              <Button variant="contained" color="primary" onClick={handleExportToImage} sx={{ mb: 2 }}>
                Export Schedule to Image
              </Button>
              <Button variant="contained" color="secondary" onClick={handleExportToExcel}>
                Export Schedule to Excel
              </Button>
            </Box>
          </Box>
        </Box>
        <Footer onDeleteAll={handleDeleteAllAppointments}/>
      </Box>
      <CustomAppointmentForm open={isCustomAppointmentFormOpen} onClose={handleCloseCustomAppointmentForm} onSave={handleSaveCustomAppointment} />
    </ThemeProvider>
  );
};

export default SchedulerApp;

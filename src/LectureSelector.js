import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, ListItemText, Divider } from '@mui/material';

const LectureSelector = ({ selectedCourse, selectedLecture, handleLectureChange, filteredLectures, adjustLectureDate, formatTime, getLectureById }) => (
  selectedCourse && (
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel id="lecture-dropdown-label">בחר הרצאה</InputLabel>
      <Select
        labelId="lecture-dropdown-label"
        id="lecture-dropdown"
        value={selectedLecture}
        onChange={(event) => handleLectureChange(event.target.value)}
        label="בחר הרצאה"
      >
        {filteredLectures.map((lecture) => {
          const adjustedLecture = adjustLectureDate(lecture);
          const linkedLecture = getLectureById(lecture.linkedId);

          if (linkedLecture) {
            const adjustedLinkedLecture = adjustLectureDate(linkedLecture);
            return (
              <MenuItem
                key={lecture.id}
                value={`${lecture.id},${linkedLecture.id}`} // Sending both IDs as a single string
              >
                <ListItemText
                  primaryTypographyProps={{ fontSize: '1rem' }} // Ensures consistent font size
                  secondaryTypographyProps={{ fontSize: '1rem' }} // Ensures consistent font size
                  primary={`${Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(adjustedLecture.startDate)}, ${formatTime(adjustedLecture.startDate)} - ${formatTime(adjustedLecture.endDate)}, ${lecture.type}, ${lecture.lecturer}`}
                  secondary={`${Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(adjustedLinkedLecture.startDate)}, ${formatTime(adjustedLinkedLecture.startDate)} - ${formatTime(adjustedLinkedLecture.endDate)}, ${linkedLecture.type}, ${linkedLecture.lecturer}`}
                />
              </MenuItem>
            );
          } else {
            return (
              <MenuItem key={lecture.id} value={lecture.id}>
                <ListItemText
                  primaryTypographyProps={{ fontSize: '1rem' }} // Ensures consistent font size
                  primary={`${Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(adjustedLecture.startDate)}, ${formatTime(adjustedLecture.startDate)} - ${formatTime(adjustedLecture.endDate)}, ${lecture.type}, ${lecture.lecturer}`}
                />
              </MenuItem>
            );
          }
        })}
      </Select>
    </FormControl>
  )
);

export default LectureSelector;

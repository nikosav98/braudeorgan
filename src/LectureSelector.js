import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, ListItemText } from '@mui/material';

const LectureSelector = ({
  selectedCourse,
  selectedLecture,
  handleLectureChange,
  filteredLectures,
  adjustLectureDate,
  formatTime,
  getLectureById,
  onHoverLecture,
  isLectureAdded // Function to check if the lecture is already added
}) => {
  const renderedLectures = new Set(); // To keep track of rendered lectures

  return (
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
            // Skip if the lecture has already been rendered
            if (renderedLectures.has(lecture.id)) return null;

            const adjustedLecture = adjustLectureDate(lecture);
            const linkedLecture = getLectureById(lecture.linkedId);

            let isDisabled = false; // To determine if the option should be disabled

            if (linkedLecture) {
              const adjustedLinkedLecture = adjustLectureDate(linkedLecture);

              // Mark both lectures as rendered
              renderedLectures.add(lecture.id);
              renderedLectures.add(linkedLecture.id);

              // Check if either of the linked lectures is already added
              isDisabled = isLectureAdded(lecture.id) || isLectureAdded(linkedLecture.id);

              return (
                <MenuItem
                  key={lecture.id}
                  value={`${lecture.id},${linkedLecture.id}`} // Sending both IDs as a single string
                  onMouseEnter={() => !isDisabled && onHoverLecture([adjustedLecture, adjustedLinkedLecture])}
                  onMouseLeave={() => onHoverLecture(null)}
                  disabled={isDisabled}
                  sx={{ opacity: isDisabled ? 0.5 : 1 }} // Apply grayed-out style if disabled
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
              // Mark the single lecture as rendered
              renderedLectures.add(lecture.id);

              // Check if the lecture is already added
              isDisabled = isLectureAdded(lecture.id);

              return (
                <MenuItem 
                  key={lecture.id} 
                  value={lecture.id}
                  onMouseEnter={() => !isDisabled && onHoverLecture([adjustedLecture])}
                  onMouseLeave={() => onHoverLecture(null)}
                  disabled={isDisabled}
                  sx={{ opacity: isDisabled ? 0.5 : 1 }} // Apply grayed-out style if disabled
                >
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
};

export default LectureSelector;

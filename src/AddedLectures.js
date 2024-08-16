import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const AddedLectures = ({ data, handleRemoveAppointment, typeToColorMap, theme, formatTime }) => (
  <FormControl fullWidth sx={{ mt: 2 }}>
    <InputLabel id="added-lectures-dropdown-label">הרצאות נבחרות (לחץ למחיקה)</InputLabel>
    <Select
      labelId="added-lectures-dropdown-label"
      id="added-lectures-dropdown"
      value=""
      onChange={(e) => handleRemoveAppointment(e.target.value)} // Use the value to remove the appointment
      label="Added Lectures"
    >
      {data.map((appointment) => {
        const appointmentType = appointment.type || 'custom'; // Default to 'custom' if type is undefined
        const backgroundColor = typeToColorMap[appointmentType] || theme.palette.background.default; // Use default background if type is not in map
        const contrastText = theme.palette.getContrastText(backgroundColor);

        return (
          <MenuItem
            key={appointment.id}
            value={appointment.id}
            style={{
              backgroundColor: backgroundColor,
              color: contrastText,
            }}
          >
            {appointment.title} - {appointmentType} ({formatTime(new Date(appointment.startDate))} - {formatTime(new Date(appointment.endDate))})
          </MenuItem>
        );
      })}
    </Select>
  </FormControl>
);

export default AddedLectures;

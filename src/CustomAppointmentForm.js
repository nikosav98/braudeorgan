import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { SketchPicker } from 'react-color';

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

const CustomAppointmentForm = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('20:00');
  const [location, setLocation] = useState('');
  const [customText, setCustomText] = useState('');
  const [color, setColor] = useState('#FF5733');

  const handleSave = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const weekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDay));

    const adjustedStartDate = new Date(weekStartDate);
    adjustedStartDate.setDate(weekStartDate.getDate() + day);
    const startDateTime = new Date(adjustedStartDate);
    startDateTime.setHours(...startTime.split(':'), 0);

    const adjustedEndDate = new Date(weekStartDate);
    adjustedEndDate.setDate(weekStartDate.getDate() + day);
    const endDateTime = new Date(adjustedEndDate);
    endDateTime.setHours(...endTime.split(':'), 0);

    const newAppointment = {
      id: new Date().getTime(), // Use current timestamp as a unique ID
      title,
      startDate: startDateTime,
      endDate: endDateTime,
      location,
      customText, // Include custom text in the appointment data
      backgroundColor: color,
      type: 'custom',
    };
    onSave(newAppointment);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Custom Appointment</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Day of the Week</InputLabel>
              <Select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              label="Start Time"
              type="time"
              fullWidth
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              inputProps={{
                min: "08:30",
                max: "20:00",
              }}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              label="End Time"
              type="time"
              fullWidth
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              inputProps={{
                min: "08:30",
                max: "20:00",
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Location (Optional)"
              type="text"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Custom Text"
              type="text"
              fullWidth
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box mt={2}>
              <SketchPicker
                color={color}
                onChangeComplete={(newColor) => setColor(newColor.hex)}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomAppointmentForm;

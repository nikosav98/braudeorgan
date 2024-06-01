import React, { useEffect, useRef } from "react";
import { IconButton, Tooltip, Button } from "@mui/material";
import { Delete, Cancel } from "@mui/icons-material";

// Utility function to adjust font size
const adjustFontSize = (element) => {
  const parent = element.parentNode;
  while (element.scrollHeight > parent.clientHeight || element.scrollWidth > parent.clientWidth) {
    const style = window.getComputedStyle(element, null).getPropertyValue('font-size');
    const currentSize = parseFloat(style);
    if (currentSize <= 10) break; // Stop if the font size gets too small
    element.style.fontSize = (currentSize - 1) + 'px';
  }
};

const CustomAppointment = ({ data, formatTime, handleRemoveAppointment, selectedAppointment, handleAppointmentClick, handleCancelDeletion }) => {
  const titleRef = useRef(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (titleRef.current && detailsRef.current) {
      adjustFontSize(titleRef.current);
      adjustFontSize(detailsRef.current);
    }
  }, []);

  const duration = (new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60); // Duration in minutes
  const isShortLesson = duration < 90; // Check if the lesson is less than 1.5 hours

  const isSelected = selectedAppointment && selectedAppointment.id === data.id;

  return (
    <div
      className={`appointment-box ${data.type}`}
      style={{
        position: 'relative',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: data.backgroundColor || 'transparent', // Use backgroundColor or fallback to transparent
        height: isShortLesson ? 'auto' : '100%', // Stretch full height for longer lessons
        overflow: isShortLesson ? 'visible' : 'hidden', // Allow text wrap for short lessons
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
      onClick={() => handleAppointmentClick(data)}
    >
      <div ref={titleRef} className="appointment-title">{data.title}</div>
      <div ref={detailsRef} className="appointment-details">
        {`${formatTime(new Date(data.startDate))} - ${formatTime(new Date(data.endDate))}`}
      </div>
      <div className="appointment-details">{data.location}</div>
      {!isShortLesson && (
        <>
          <div className="appointment-details">{data.type}</div>
          <div className="appointment-details">{data.lecturer}</div>
        </>
      )}
      {isSelected && (
        <>
          <Tooltip title="Remove" className="appointment-tooltip" style={{ position: 'absolute', top: '5px', right: '5px' }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemoveAppointment(data.id); }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button size="small" variant="contained" color="secondary" onClick={(e) => { e.stopPropagation(); handleCancelDeletion(); }} style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
            <Cancel fontSize="small" />
          </Button>
        </>
      )}
    </div>
  );
};

export default CustomAppointment;
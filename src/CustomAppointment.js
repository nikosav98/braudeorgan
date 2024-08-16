import React, { useEffect, useRef, useState } from "react";
import { IconButton, Tooltip, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { Delete, Cancel, Palette, NoteAdd } from "@mui/icons-material";

const adjustFontSize = (element) => {
  const parent = element.parentNode;
  while (element.scrollHeight > parent.clientHeight || element.scrollWidth > parent.clientWidth) {
    const style = window.getComputedStyle(element, null).getPropertyValue('font-size');
    const currentSize = parseFloat(style);
    if (currentSize <= 10) break;
    element.style.fontSize = (currentSize - 1) + 'px';
  }
};

const CustomAppointment = ({ 
  data, 
  formatTime, 
  handleRemoveAppointment, 
  selectedAppointment, 
  handleAppointmentClick, 
  handleCancelDeletion, 
  handleColorChange,
  handleSaveNote,
}) => {
  const titleRef = useRef(null);
  const detailsRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [note, setNote] = useState(data.customText || "");

  const presetColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5', '#FF8C33', 
    '#8C33FF', '#FFC733', '#FF3333', '#33FF8C', '#5733FF', '#FF5733',
  ];

  useEffect(() => {
    if (titleRef.current && detailsRef.current) {
      adjustFontSize(titleRef.current);
      adjustFontSize(detailsRef.current);
    }
  }, []);

  const duration = (new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60);
  const isShortLesson = duration < 90;

  const isSelected = selectedAppointment && selectedAppointment.id === data.id;

  const handleOpenNotesDialog = () => {
    setIsNotesDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setIsNotesDialogOpen(false);
  };

  const handleSaveNoteInDialog = () => {
    handleSaveNote && handleSaveNote(data.id, note);
    handleCloseNotesDialog();
  };

  return (
    <div
      className={`appointment-box ${data.type}`}
      style={{
        position: 'relative',
        padding: '0px',
        margin: '-5px', 
        borderRadius: '0px',
        border: '2px solid',
        fontSize: '12px',
        backgroundColor: data.backgroundColor || 'transparent',
        height: isShortLesson ? 'auto' : '100%', 
        overflow: 'hidden',
        display: 'flex',
        width: '100%', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
      onClick={() => handleAppointmentClick(data)}
    >
      <div ref={titleRef} className="appointment-title" style={{ fontSize: '14px', fontWeight: 'bold' }}>
        {data.title}
      </div>
      <div ref={detailsRef} className="appointment-details" style={{ fontSize: '12px' }}>
        {`${formatTime(new Date(data.startDate))} - ${formatTime(new Date(data.endDate))}`}
      </div>
      <div className="appointment-details" style={{ fontSize: '12px' }}>
        {data.location}
      </div>
      {!isShortLesson && (
        <>
          <div className="appointment-details">{data.type}</div>
          <div className="appointment-details">{data.lecturer}</div>
        </>
      )}
      {isSelected && (
        <>
          <Tooltip title="Remove" className="appointment-tooltip">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleRemoveAppointment(data.id); }}
              sx={{
                color: "#000000",
                position: 'absolute',
                top: '5px',
                left: '5px',
                background: 'none',
                padding: 0,
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cancel" className="appointment-tooltip">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleCancelDeletion(); }}
              sx={{
                color: "#000000",
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'none',
                padding: 0,
              }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Change Color" className="appointment-tooltip">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
              sx={{
                color: "#000000",
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                background: 'none',
                padding: 0,
              }}
            >
              <Palette fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View/Edit Notes">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleOpenNotesDialog(); }}
              sx={{
                color: "#000000",
                position: 'absolute',
                bottom: '5px',
                left: '5px',
                background: 'none',
                padding: 0,
              }}
            >
              <NoteAdd fontSize="small" />
            </IconButton>
          </Tooltip>

          {showColorPicker && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '30px',
                right: '5px',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                zIndex: 10
              }}
            >
              {presetColors.map((color) => (
                <Box
                  key={color}
                  onClick={(e) => { e.stopPropagation(); handleColorChange(data.id, color); setShowColorPicker(false); }}
                  sx={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    margin: '2px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                  }}
                />
              ))}
            </Box>
          )}
        </>
      )}

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onClose={handleCloseNotesDialog}>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            multiline
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotesDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveNoteInDialog} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomAppointment;

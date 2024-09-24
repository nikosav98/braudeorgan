import React from 'react';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const Footer = ({ onDeleteAll }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteAll();
    handleClose();
  };

  return (
    <Box sx={{ backgroundColor: 'var(--footer-bg-color)', position: 'relative' }}>
      <Box mt={2} textAlign="center" className="footer-container">
        <Typography variant="body2" className="footer-text">
          <a>This site is not affiliated with Braude College and is a personal project. Made by Niko. Wanna help me out? Buy me a coffee when you see me. v3.0</a>
        </Typography>
      </Box>
      <Button 
        variant="contained" 
        color="error" 
        size="small" 
        sx={{ 
          position: 'absolute', 
          right: '10px', 
          top: '50%',  
          zIndex: 1
        }} 
        onClick={handleClickOpen}
      >
        Delete All
      </Button>

      <Dialog open={open} onClose={handleClose} dir="rtl">
        <DialogTitle dir="rtl">אישור מחיקה</DialogTitle>
        <DialogContent dir="rtl">
          <DialogContentText dir="rtl">
            האם ברצונך למחוק את כל ההרצאות?
          </DialogContentText>
        </DialogContent>
        <DialogActions dir="rtl">
          <Button onClick={handleClose} color="primary">
            ביטול
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            מחק הכל
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Footer;

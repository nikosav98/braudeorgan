import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css'; // Ensure you have defined .no-scroll in your CSS

const splashTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const SplashScreen = ({ handleOptOut, handleAccept }) => {
  useEffect(() => {
    // Add no-scroll class to body
    document.body.classList.add('no-scroll');

    // Remove no-scroll class when component is unmounted
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <ThemeProvider theme={splashTheme}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        height="25vh" // Adjust height as necessary
        width="40vw" // Adjust width as necessary
        position="fixed"
        top="30%" // Position it vertically within the screen
        left="30%" // Position it horizontally within the screen
        bgcolor="rgba(0, 0, 0, 0.9)" // Dark background for the splash screen itself
        zIndex="1300"
        borderRadius="8px"
        p={4}
        dir="rtl" // Set text direction to right-to-left for Hebrew
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.5)" // Adds a subtle shadow to give it a "window" feel
      >
        <Box flex="1" textAlign="right" width="100%">
          <Typography variant="h5" color="white" mb={2}>
            הודעה על השימוש ב-Google Analytics
          </Typography>
          <Typography variant="body1" color="white">
            אתר זה עושה שימוש ב-Google Analytics לצורך שיפור חווית המשתמש. באפשרותך לבחור לקבל או לדחות את השימוש בשירות זה.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%" mt={4}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleOptOut} 
            sx={{ mr: 2, fontSize: '1rem', padding: '8px 16px' }} // Slightly larger buttons
          >
            דחה
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAccept} 
            sx={{ fontSize: '1rem', padding: '8px 16px' }} // Slightly larger buttons
          >
            קבל
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SplashScreen;

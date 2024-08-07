import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css'; // Make sure to import your CSS file where .no-scroll is defined

const splashTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const SplashScreen = () => {
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
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100vw"
        position="fixed"
        top="0"
        left="0"
        bgcolor="rgba(0, 0, 0, 0.85)"
        zIndex="1300"
      >
        <Typography variant="h4" color="white">
          התוכנה תחזור לעבוד לקראת סמסטר חורף 2024
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default SplashScreen;

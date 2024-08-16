import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box sx={{ backgroundColor: 'var(--footer-bg-color)' }}>
    <Box mt={2} textAlign="center" className="footer-container">
      <Typography variant="body2" className="footer-text">
        <a>This site is not affiliated with Braude College and is a personal project. Made by Niko. Wanna help me out? Buy me a coffee when you see me.</a>
      </Typography>
    </Box>
  </Box>
);

export default Footer;

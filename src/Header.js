import React from 'react';
import { AppBar, Toolbar, Typography, Switch, Box } from '@mui/material';

const Header = ({ isMobile, allowConflicts, handleToggleChange }) => (
  <AppBar position="static">
    <Toolbar>
      <Box flexGrow={1} textAlign={isMobile ? 'center' : 'left'}>
        <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif'}}>
          {isMobile ? 'Brauade Organ' : 'Braude Schedule Organizer - updated 24/09/24'}
        </Typography>
      </Box>
      {!isMobile && (
        <Box>
          <Typography variant="body1" component="span">
            Allow Conflicts
          </Typography>
          <Switch checked={allowConflicts} onChange={handleToggleChange} />
        </Box>
      )}
    </Toolbar>
  </AppBar>
);

export default Header;

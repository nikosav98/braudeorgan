import React from 'react';
import { Popper, ClickAwayListener, MenuList, MenuItem, TextField, FormControl, Paper, useMediaQuery } from '@mui/material';

const SearchCourse = ({ searchInput, handleSearchChange, isDropdownOpen, anchorEl, handleClickAway, filteredCourses, handleCourseChange }) => {
  const isMobile = useMediaQuery('(max-width:767px)');

  return (
    <FormControl fullWidth>
      <TextField
        fullWidth
        label="חיפוש קורס"ד
        variant="outlined"
        text-align="right"
        value={searchInput}
        onChange={handleSearchChange}
        sx={{ marginBottom: 2, textAlign: 'right',fontSize: isMobile ? '12px' : '16px'  }} // Align the label and input text to the right
            inputProps={{
            style: { textAlign: 'right' }, // Align input text to the right
            autoComplete: 'off',
            spellCheck: false,
        }}
      />
      <Popper open={isDropdownOpen} anchorEl={anchorEl} style={{ zIndex: 1 }}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper style={{ maxHeight: 300, overflow: 'auto', width: isMobile ? '90%' : 'auto',direction: 'rtl' }}>
            <MenuList style={{direction: 'rtl'}}>
              {filteredCourses.slice(0, 500).map((courseName, index) => (
                <MenuItem key={index} onClick={() => handleCourseChange(courseName)}>
                  {courseName}
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </FormControl>
  );
};

export default SearchCourse;

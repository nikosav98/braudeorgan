import React from 'react';
import TableCell from '@mui/material/TableCell';

const DayScaleCell = ({ startDate }) => (
  <TableCell style={{ width: "100px", borderRight: "0px solid rgba(255, 255, 255, 1.2)", height: "50%", textAlign: 'center' }}>
    <span>
      {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(startDate)}
    </span>
  </TableCell>
);

export default DayScaleCell;

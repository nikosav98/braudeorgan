import React from "react";
import { render } from "react-dom";
import Paper from "@mui/material/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";
import TableCell from "@mui/material/TableCell";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import { appointments } from "./data";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: blue,
  },
});

const DayScaleCell = ({ startDate }) => (
  <TableCell>
    <span>
      {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(startDate)}
    </span>
  </TableCell>
);

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: appointments,
    };
  }

  render() {
    const { data } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <Paper>
          <Scheduler data={data}>
            <ViewState currentDate="2018-06-28" />
            <WeekView
              startDayHour={9}
              endDayHour={19}
              dayScaleCellComponent={DayScaleCell}
            />
            <Appointments />
          </Scheduler>
        </Paper>
      </ThemeProvider>
    );
  }
}

export(<App />, document.getElementById("root"));

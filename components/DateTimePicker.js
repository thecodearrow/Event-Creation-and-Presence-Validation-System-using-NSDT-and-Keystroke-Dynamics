import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';

const styles = {
    grid: {
        width: '100%',
    },
};

class DateTimePicker extends React.Component {
  state = {
    selectedEventDate: new Date("2019-01-01T00:00:00"),
    selectedStartDate: new Date("2019-01-01T00:00:00"),
    selectedEndDate: new Date("2019-01-01T00:00:00")
  };

  handleDateChange = (i,date) => {
    var whichDate = i === 1 ? {
            selectedStartDate: date
        } : ( i === 2 ? {
            selectedEndDate: date
    } : {
        selectedEventDate: date
    });

    this.setState({
        ...whichDate,
    },() =>{
        this.props.handleDateChange(this.state.selectedStartDate,this.state.selectedEndDate);
    });
  };

  render() {
    const { classes } = this.props;
    const { selectedEventDate, selectedStartDate, selectedEndDate } = this.state;

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container className={classes.grid} justify="space-around">
          <DatePicker
            margin="normal"
            label="Event Date"
            value={selectedEventDate}
            onChange={this.handleDateChange.bind(this,0)}
          />
          <TimePicker
            margin="normal"
            label="Event Start Time"
            value={selectedStartDate}
            onChange={this.handleDateChange.bind(this,1)}
          />
          <TimePicker
            margin="normal"
            label="Event End Time"
            value={selectedEndDate}
            onChange={this.handleDateChange.bind(this,2)}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    );
  }
}

DateTimePicker.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DateTimePicker);

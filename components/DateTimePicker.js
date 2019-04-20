import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import DateFnsUtils from '@date-io/date-fns'
import {
  MuiPickersUtilsProvider,
  TimePicker,
  DatePicker,
} from 'material-ui-pickers'

const styles = {
  grid: {
    width: '100%',
    marginLeft: '0.5em',
    marginRight: '0.5em',
  },
}

class DateTimePicker extends React.Component {
  state = {
    selectedEventDate:
      this.props.eventDate === undefined ? new Date() : this.props.eventDate,
    selectedStartDate:
      this.props.eventStartDate === undefined
        ? new Date()
        : this.props.eventStartDate,
    selectedEndDate:
      this.props.eventEndDate === undefined
        ? new Date()
        : this.props.eventEndDate,
  }

  handleDateChange(i, date) {
    let whichDate =
      i == 1
        ? {
            selectedStartDate: date,
          }
        : i == 2
        ? {
            selectedEndDate: date,
          }
        : {
            selectedStartDate: date,
            selectedEndDate: date,
            selectedEventDate: date,
          }
    this.setState(
      {
        ...whichDate,
      },
      () => {
        this.props.handleDateChange(
          this.state.selectedStartDate,
          this.state.selectedEndDate,
          this.state.selectedEventDate
        )
      }
    )
  }

  render() {
    const { classes } = this.props
    const { selectedEventDate, selectedStartDate, selectedEndDate } = this.state

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container className={classes.grid} justify="space-between">
          <DatePicker
            margin="normal"
            label="Event Date"
            variant="outlined"
            value={selectedEventDate}
            onChange={this.handleDateChange.bind(this, 0)}
          />
          <TimePicker
            margin="normal"
            label="Event Start Time"
            variant="outlined"
            value={selectedStartDate}
            onChange={this.handleDateChange.bind(this, 1)}
          />
          <TimePicker
            margin="normal"
            variant="outlined"
            label="Event End Time"
            value={selectedEndDate}
            onChange={this.handleDateChange.bind(this, 2)}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    )
  }
}

DateTimePicker.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(DateTimePicker)

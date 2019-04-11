import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Snackbar from "@material-ui/core/Snackbar";
import Fade from "@material-ui/core/Fade";

import Loader from '../components/Loading';

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";

import DateTimePicker from '../components/DateTimePicker';


const styles = theme => ({
    head: {
        textAlign: 'center'
    },
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    instructions: {
        textAlign: 'center',
        fontWeight: '200',
        color: 'red'
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginTop:'1em',
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    button: {
        marginTop: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit
    },
    menu: {
        marginTop:'0em',
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    }
});

class Create extends Component {

    constructor() {
        super();
        this.FBRef = loadFirebase().firestore().collection('events');
        this.state = {
            user: '',
            eventName: '',
            location: 'Event Location',
            startDate:'',
            endDate: '',
            eventDate: '',
            mode: false,
            open: false,
            formError: "ERROR"
        }
    }

    handleChange(e) {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value,
            formError: e.target.value.length === 0 ? "ERROR" : (this.state.location === 'Event Location' ?
              "ERROR": "")
        })
    }

    handleSwitchChange = name => event => {
      this.setState({ [name]: event.target.checked });
    }

    componentDidMount() {
        loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    ...this.state,
                    user: user
                })
                return user
                    .getIdToken()
                    .then(token => {
                        return fetch('/api/login', {
                            method: 'POST',
                            headers: new Headers({ 'Content-Type': 'application/json' }),
                            credentials: 'same-origin',
                            body: JSON.stringify({ token })
                        })
                    })
            } else {
                Router.push('/');
            }
        })
    }

    handleLogout() {
        loadFirebase().auth().signOut()
    }

    handleSelectChange(e) {
        this.setState({
            ...this.state,
            location:e.target.value,
            formError: e.target.value === 'Event Location' ? "ERROR" : (this.state.eventName.length === 0 ?
            "ERROR" : "")
        });
    } 

    handleDateChange(startDate, endDate, eventDate) {
      if (eventDate.getDate() < new Date().getDate() || eventDate.getMonth() < new Date().getMonth() || eventDate.getFullYear() < new Date().getFullYear() || (startDate.getTime() < new Date().getTime()) ) {
        this.setState({
          formError: "Event Date has already passed",
          open: true
        })
      }
      else if (startDate > endDate){
        this.setState({
            formError: "Start Time should be ahead of End Time of event",
            open: true
        })
      }
      else {
        this.setState({
          formError: ((this.state.location !== 'Event Location') && (this.state.eventName !== '') ? "" : "ERROR"),
          open: false,
          eventDate,
          startDate,
          endDate
        })
      }
    }

    handleClose = () => {
      this.setState({ open: false });
    };

    submitHandler () {
      const eventData = {
          eventName: this.state.eventName,
          startDate: this.state.startDate.toLocaleString('en-GB'),
          endDate: this.state.endDate.toLocaleString('en-GB'),
          eventDate: this.state.eventDate.toLocaleString('en-GB').substr(0,10),
          location: this.state.location,
          mode: this.state.mode ? "STRICT" : "NOSTRICT",
          organizer_email: this.state.user.email,
          attendees:[]
      }
      //perform a check whether event exists already at same loc, time, date (or) same title, then perform ADD as below
      this.FBRef.add({
        ...eventData
      }).then(function (docRef) {
        window.location = "https://" + window.location.host + '/dashboard';
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });    
    }

    render() {
        const { classes } = this.props;
        return (
          <React.Fragment>
            {this.state.user !== '' ? (
              <React.Fragment>
                <Navbar
                  page="create"
                  email={this.state.user.email.includes("srmuniv")}
                  handleLogout={this.handleLogout.bind(this)}
                />
                <Grid
                  container
                  spacing={0}
                  direction="row"
                  alignItems="center"
                  justify="center"
                  style={{ minHeight: "90vh" }}
                >
                  { this.state.user.email /*.includes('srmuniv')*/ ? (
                    <React.Fragment>
                      <Grid item xs={1} sm={3} />
                      <Grid item xs={10} sm={6}>
                        <Paper className={classes.root} elevation={2}>
                          <Typography
                            variant="h2"
                            component="h2"
                            className={classes.head}
                          >
                            Create an Event
                          </Typography>
                          <form
                            className={classes.container}
                            noValidate
                            autoComplete="off"
                          >
                            <TextField
                              variant="outlined"
                              name="eventName"
                              id="eventName"
                              placeholder="Event Name"
                              fullWidth={true}
                              value={this.state.eventName}
                              onChange={e => {
                                this.handleChange(e);
                              }}
                              className={classes.textField}
                              margin="normal"
                            />
                            <DateTimePicker handleDateChange = {this.handleDateChange.bind(this)} />
                            <TextField
                              variant="outlined"
                              select
                              name="location"
                              className={classes.textField}
                              value={this.state.location}
                              onChange={e => {
                                this.handleSelectChange(e);
                              }}
                              SelectProps={{
                                MenuProps: {
                                  className: classes.menu
                                }
                              }}
                              fullWidth={true}
                              margin="normal"
                            >
                              {["Event Location","UB", "TP", "Audi"].map(el => (
                                <MenuItem key={el} value={el}>
                                  {el}
                                </MenuItem>
                              ))}
                            </TextField>
                            <FormControlLabel
                              style={{ marginLeft: '0em', marginTop: '1em' }}
                              control={ <Switch
                                checked={this.state.mode}
                                onChange={this.handleSwitchChange('mode')}
                                value="strictMode"
                                color="primary"
                              />
                              }
                              label="Strict Mode (enforces Biometrics)"
                            />
                            <Button
                              variant="contained"
                              disabled={!this.state.formError == ""}
                              color="primary"
                              fullWidth
                              style={{ marginTop: "3em", marginLeft: "0" }}
                              onClick={e => {
                                this.submitHandler();
                              }}
                              className={classes.button}
                            >
                              CREATE
                            </Button>
                          </form>
                        </Paper>
                      </Grid>
                      <Grid item xs={1} sm={3} />
                    </React.Fragment>) : (
                    <Typography variant="h2">You are not authorized to create events</Typography> )
                }
                </Grid>
                <Snackbar
                  open={this.state.open}
                  onClose={this.handleClose}
                  TransitionComponent={Fade}
                  ContentProps={{
                    'aria-describedby': 'message-id',
                  }}
                  message={<span id="message-id">{this.state.formError}</span>}
                />
              </React.Fragment>
            ) : (
              <Loader />
            )}
          </React.Fragment>
        );
    }
}

Create.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Create);
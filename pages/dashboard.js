import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import Button from '@material-ui/core/Button';
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Paper from "@material-ui/core/Paper";
import Modal from "@material-ui/core/Modal";
import DateTimePicker from "../components/DateTimePicker";
import Snackbar from "@material-ui/core/Snackbar";
import Fade from "@material-ui/core/Fade";

import Loader from "../components/Loading";
import ClassCard from "../components/ClassCard";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";
import { Typography } from '../node_modules/@material-ui/core';

const styles = theme => ({
    head: {
        textAlign: "center"
    },
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    },
    instructions: {
        textAlign: "center",
        fontWeight: "200",
        color: "red"
    },
    // container: {
    //     display: "flex",
    //     flexWrap: "wrap"
    // },
    form: {
        height: 0
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    button: {
        margin: theme.spacing.unit,
    },
    buttonInfoTypo: {
        paddingTop: '0.5em',
        color: 'red'
    },
    buttonLink: {
        textDecoration: 'none',
        color: 'white'
    },
    modal: {
        width: '50vw',
        transform: 'translate(25vw,20vh)',
        padding: '2em'
    }
});

class Dashboard extends Component {

    constructor() {
        super();
        this.FBRef = loadFirebase()
          .firestore()
          .collection("events");
        this.FBRefAtt = loadFirebase()
            .firestore()
            .collection("attendees");
        this.state = {
            user: '',
            eventList: [],
            upcoming: false,
            passed: false,
            modalOpen:false,
            KSDtested: null,
            location: '',
            eventName: '',
            eventCode: '',
            eventMode: '',
            eventDate: '',
            startDate: '',
            endDate: '',
            open: false,
            formError: "ERROR"
        }
    }

    handleSelectChange(e) {
    this.setState({
      ...this.state,
      location: e.target.value,
      formError: e.target.value === 'Event Location' ? "ERROR" : (this.state.eventName.length === 0 ?
        "ERROR" : "")
    });
  }

    handleSwitchChange = name => event => {
        this.setState({ [name]: event.target.checked });
    }

    handleDateChange(startDate, endDate, eventDate) {
        if (eventDate.getDate() < new Date().getDate() || eventDate.getMonth() < new Date().getMonth() || eventDate.getFullYear() < new Date().getFullYear() || (startDate.getTime() < new Date().getTime())) {
        this.setState({
            formError: "Event Date has already passed",
            open: true
        })
        }
        else if (startDate > endDate) {
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

     submitHandler () {
      const eventData = {
          eventName: this.state.eventName,
          startDate: this.state.startDate.toLocaleString('en-GB'),
          endDate: this.state.endDate.toLocaleString('en-GB'),
          eventDate: this.state.eventDate.toLocaleString('en-GB').substr(0,10),
          location: this.state.location,
          mode: this.state.eventMode ? "STRICT" : "NOSTRICT"
      }

      this.FBRef.doc(this.state.eventCode)
      .update({
        ...eventData
      }).then( (docRef) => {
            this.setState({
                eventList: this.state.eventList.map( el => {
                    if(el.id === this.state.eventCode){
                        return {
                            id: el.id,
                            data: {
                                ...el.data,
                                eventName: this.state.eventName,
                                startDate: this.state.startDate.toLocaleString('en-GB'),
                                endDate: this.state.endDate.toLocaleString('en-GB'),
                                eventDate: this.state.eventDate.toLocaleString('en-GB').substr(0,10),
                                mode: this.state.eventMode,
                                location: this.state.location
                            }
                        }
                    }
                    return el;
                }),
                modalOpen: false,
                location: '',
                eventName: '',
                eventCode: '',
                eventMode: '',
                eventDate: '',
                startDate: '',
                endDate: '',
                open: false,
                formError: "ERROR"
            })
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });    
    }

    async componentDidMount() {
        await loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                if(!user.email.includes("srmuniv")){
                    Router.push('/choose');
                }
                this.setState({
                    ...this.state,
                    user: user
                },
                async () => {
                    if (await this.checkKSDRecords()) {
                        this.setState({
                            KSDtested: true
                        })
                    }
                    let eventList =[];
                    await this.FBRef.where("organizer_email","==",this.state.user.email)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            eventList.push({id:doc.id,data:doc.data()})
                        });
                    })
                    .catch(function (error) {
                        console.log("Error getting documents: ", error);
                    })
                    this.setState({
                        eventList
                    })
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
                //this.handleLogout();
                window.location = window.location.protocol + "//" + window.location.host + "/";
            }
        })
    }

    handleChange(e) {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value,
            formError: e.target.value.length === 0 ? "ERROR" : (this.state.location === 'Event Location' ?
                "ERROR" : "")
        })
    }

    async checkKSDRecords() {
        const res = await this.FBRefAtt.where("user", "==", this.state.user.email)
            .get().then(function (querySnapshot) {
                if(querySnapshot.docs.length === 0) {
                    Router.push('/attendeeRegister');
                    return false;
                }
                else {
                    return true;
                }
            })
            .catch(function (error) {
                Router.push('/attendeeRegister');
            });  
        return res; 
    }

    successNotify() {   
        setTimeout( () => {
            this.setState({
                formError: "ERROR",
                open : false
            })
        }, 4000);
    }

    failureNotify() {
        setTimeout( () => {
            this.setState({
                formError: "ERROR",
                open: false
            })
        }, 4000);
    }

    deleteEvent(eventCode) {
        const eventToDelete = this.state.eventList.filter( el => {
            return el.id.startsWith(eventCode);
        })
        const eventToDeleteID = eventToDelete[0].id;
        this.FBRef.doc(eventToDeleteID)
          .delete()
          .then(() => {
              this.setState({
                eventList : this.state.eventList.filter( el => el.id !== eventToDeleteID),
                formError: `"${eventToDelete[0].data.eventName}" Deleted Successfully :)`,
                open: true
              }, () => {
                    this.successNotify();
                })
            })
          .catch(() => {
              this.setState({
                formError: `"${
                  eventToDelete[0].data.eventName
                }" Failed to Delete :(`,
                open: true
              },() => {
                this.failureNotify();
            })
        });
    }

    openModal(UpdateEventObj){
        this.setState({
            modalOpen: true,
            location: UpdateEventObj.eventLocation,
            eventName: UpdateEventObj.eventName,
            eventCode: UpdateEventObj.eventCode,
            eventMode: UpdateEventObj.eventMode,
            eventDate:UpdateEventObj.eventDate,
            startDate:UpdateEventObj.eventStartDate,
            endDate:UpdateEventObj.eventEndDate
        })
        //console.log(UpdateEventObj.eventDate.toLocaleString('en-GB'),new Date().toLocaleDateString('en-GB'))
    }
    toUKDateString(dateString){
        if(typeof(dateString) === 'string'){
            const month = dateString.substr(0,3);
            const date = dateString.substr(3,3);
            return date + month + dateString.substr(6);
        } else if(typeof(dateString) === 'object'){
            return dateString;
        }
    }

    handleClose = () => {
        this.setState({ open: false });
    };

    handleLogout() {
        loadFirebase().auth().signOut()
    }

    render() {
        const { classes } = this.props;
        const currDate = new Date().toLocaleString('en-GB');
        const ModalComp = (<Modal 
            open={this.state.modalOpen} 
            onBackdropClick={()=>this.setState({modalOpen: false})}
        >
            <form
                className={classes.form}
                noValidate
                autoComplete="off"
            >
                <Paper elevation={1} className={classes.modal}>
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
                    <DateTimePicker
                        eventDate = {new Date(this.toUKDateString(this.state.eventDate))}
                        eventStartDate = {new Date(this.toUKDateString(this.state.startDate))}
                        eventEndDate = {new Date(this.toUKDateString(this.state.endDate))}
                        handleDateChange={this.handleDateChange.bind(
                            this
                        )}
                    />
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
                        {["Event Location", "UB", "TP", "Audi"].map(
                            el => (
                                <MenuItem key={el} value={el}>
                                    {el}
                                </MenuItem>
                            )
                        )}
                    </TextField>
                    <FormControlLabel
                        style={{ marginLeft: "0em", marginTop: "1em" }}
                        control={
                            <Switch
                                checked={this.state.eventMode}
                                onChange={this.handleSwitchChange("mode")}
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
                        UPDATE
                    </Button>
                </Paper>
            </form>
        </Modal>);
        return (
          <React.Fragment>
            { typeof(this.state.user) !== "string" && this.state.user.email.includes('srmuniv') && this.state.KSDtested !== null ? (
              <React.Fragment>
                <Snackbar
                  open={this.state.open}
                  onClose={this.handleClose}
                  TransitionComponent={Fade}
                  ContentProps={{
                    'aria-describedby': 'message-id',
                  }}
                  message={<span id="message-id">{this.state.formError}</span>}
                />
                <Navbar
                  page="dashboard"
                  email={this.state.user.email.includes("srmuniv")}
                  handleLogout={this.handleLogout.bind(this)}
                />
                <Typography
                  variant="h2"
                  style={{
                    textAlign: "center",
                    marginTop: "15vh",
                    marginBottom: "6vh"
                  }}
                >
                  Events You have Created
                </Typography>
                <Grid
                  container
                  spacing={0}
                  direction="row"
                  justify="space-evenly"
                  alignContent="space-around"
                >
                  <Grid item>
                    <Typography inline variant="subtitle2">
                        FILTER BY:
                    </Typography>
                    <Button
                        color="primary"
                        disabled={!(this.state.upcoming || this.state.passed)}
                        onClick={
                            (e) => {
                                this.setState({
                                    upcoming: false,
                                    passed: false
                                })
                            }
                        }
                        className={classes.button}>
                        ALL
                    </Button>
                    <Button 
                        color="primary"
                        disabled={this.state.upcoming}
                        onClick={
                            (e) => {
                                this.setState({
                                    passed: false,
                                    upcoming: true
                                })
                            }
                        } 
                        className={classes.button}>
                        UPCOMING
                    </Button>
                    <Button
                      color="secondary"
                      disabled={this.state.passed}
                      className={classes.button}
                      onClick={
                          (e) => {
                              this.setState({
                                  upcoming:false,
                                  passed: true
                              })
                          }
                      }
                    >
                      PASSED
                    </Button>
                    <Button
                      href="/create"
                      color="primary"
                      variant="contained"
                      className={classes.button}
                    >
                      CREATE NEW +
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={0}
                  direction="row"
                  alignItems="baseline"
                  justify="space-evenly"
                  style={{ minHeight: "50vh", marginTop: "4vh" }}
                >
                  {ModalComp}  
                  {this.state.user.email.includes("srmuniv") ? (
                    this.state.eventList.length > 0 ? (
                      this.state.eventList
                        .sort( (el1,el2) => {
                            return (
                              new Date(
                                el2.data.startDate
                              ) -
                              new Date(
                                el1.data.startDate
                              )
                            );
                        })
                        .filter( (el) => {
                            if(this.state.upcoming){
                                return el.data.startDate >= currDate
                            } else if(this.state.passed){
                                return el.data.endDate <= currDate
                            } 
                            return true
                        })
                        .map((el, i) => (
                        <Grid key={i} item>
                          <ClassCard
                            key={i}
                            bgCol={el.data.endDate <= currDate}
                            eventCode={el.id}
                            eventName={el.data.eventName}
                            eventStart={el.data.startDate}
                            eventDate={el.data.eventDate}
                            eventEnd={el.data.endDate}
                            eventLocation={el.data.location}
                            eventMode={el.data.mode}
                            deleteEvent={this.deleteEvent.bind(this)}
                            openModal={this.openModal.bind(this)}
                          />
                        </Grid>
                      ))
                    ) : (
                        <Typography variant="h2">
                            You have not created any events, yet
                        </Typography>
                    )
                  ) : (
                    true
                  )}
                </Grid>
              </React.Fragment>
            ) : (
              <Loader />
            )}
          </React.Fragment>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
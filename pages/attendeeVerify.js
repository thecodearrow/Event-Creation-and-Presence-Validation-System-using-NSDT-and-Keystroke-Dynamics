import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";

import Loader from "../components/Loading";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import firebase from 'firebase/app';
import "firebase/auth";
import "isomorphic-unfetch";
import { withSnackbar } from 'notistack';

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
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    button: {
        marginTop: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit
    },
    menu: {
        width: '200',
    }
});

class AttendeeVerify extends Component {

    constructor() {
        super();

        this.tdna=""

        this.eCode = ''

        this.initialText =
          "Please type the way you normally do. This is to ensure that you were physically present during the event and your attendance is being validated as you type";

        this.FBRef = loadFirebase()
          .firestore()
          .collection("attendees");

        this.FBRefEvents = loadFirebase()
            .firestore()
            .collection("events");

        this.state = {
            user: '',
            location: '',
            dateTime: '',
            currentTypingPattern:'',
            attendanceStatus: false,
            buttonActive: false,
            ksdTest: "",
            KSDtested: null
        }
    }

    handleChange(e) {
        if (!(e.target.value.toLowerCase() !== this.initialText.toLowerCase().substr(0, e.target.value.length))) {
            this.setState({
                ...this.state,
                [e.target.name]: e.target.value
            })
        }
    }

    async componentDidMount() {
        this.tdna = new TypingDNA()

        loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    ...this.state,
                    user: user
                }, async () => {
                    this.eCode = decodeURIComponent(
                        window.location.href.split("/").pop()
                    );
                    this.setState({
                        buttonActive: true
                    })
                    if (this.eCode === 'attendeeVerify') {
                        window.location = window.location.protocol + "//" + window.location.host + '/choose';
                    }
                    if (await this.checkKSDRecords()) {
                        this.setState({
                            KSDtested: true
                        })
                    }
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
            location: e.target.value
        });
    }


    successNotify(){
        const message_success="Attendance Marked";

        this.props.enqueueSnackbar(message_success, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
            }      
        });
        setTimeout(() => {
            window.location = window.location.protocol + "//" + window.location.host + '/choose';
        }, 4000);

    }

    failureNotify(){
        const message_failure="Failed to valiate. Please type again. ";
        this.props.enqueueSnackbar(message_failure, { 
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        }
      });

    }

     postRequestAndMatchTypingPatterns(tp1,tp2){

        fetch('/attendeeVerify', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({tp1:tp1,tp2:tp2})  //Sending tp1 and tp2
            })
            .then(res => res.json())
            .then(response =>{

                const decider=response["score"];

                //console.log(decider); // @TODO REMOVE CONSOLE LOGS LIKE THIS

                if(decider>=70){ //temp change to 70
                    this.FBRefEvents.doc(this.eCode)
                    .update({
                        attendees: firebase.firestore.FieldValue.arrayUnion(this.state.user.email)
                    })
                    .then(() => this.successNotify());
                }
                else{
                    this.failureNotify();
                }
            })
            .catch(error => console.error('Error:', error));

    
       
    }

    async checkKSDRecords() {
        const res = await this.FBRef.where("user", "==", this.state.user.email)
            .get().then(function (querySnapshot) {
                if (querySnapshot.docs.length === 0) {
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

    async submitHandler() {

        const eventData = {
            ...this.state,
            user: this.state.user.email,
            currentTypingPattern:this.tdna.getTypingPattern({type:0, length:150}),
            attendanceStatus:true //to be updated based on match(tp1,tp2) and firebase retrieval status
        }
        //console.log(eventData.currentTypingPattern);

        //Retrive Typing Pattern from Firebase for eventData.user 

        let that = this; // keep function level ref of 'this for func below 

        this.FBRef.where("user","==",this.state.user.email)
        .get().then(function (querySnapshot) {
            querySnapshot.forEach(async function (doc) {
                const dbTypingPattern = doc.data().typingPattern;
                that.postRequestAndMatchTypingPatterns(dbTypingPattern,eventData.currentTypingPattern);
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

        // Snackbar Notifications => Can be DB failure, Match Failure too... Customise accordingly
        // Have handled Match Failure in  postRequestAndMatchTypingPatterns 
    }

    render() {
        const { classes } = this.props;
        const lenTyped = this.state.ksdTest.length;
        const tester = this.initialText.substr(0, lenTyped).toLowerCase() === this.state.ksdTest.toLowerCase();
        return (
          <React.Fragment>
            { (typeof(this.state.user) !== "string" && this.state.KSDtested !== null) ? (
            <React.Fragment>
                <Navbar
                    page="attendeeVerify"
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
                    <Grid item xs={1} sm={3} />
                    <Grid item xs={10} sm={6}>
                    <Paper className={classes.root} elevation={2}>
                        <Typography
                        variant="h2"
                        component="h2"
                        className={classes.head}
                        >
                        Verify Biometrics
                        </Typography>{" "}
                        <br />
                        <Typography
                            variant="h6"
                            className={classes.head}
                        >
                            <span
                                style={tester ? { color: "white", backgroundColor: 'midnightblue' } : { color: "midnightblue" }}
                            >
                                {this.initialText.substr(0, lenTyped)}
                            </span>
                            <span
                                style={{ color: "midnightblue" }}
                            >
                                {this.initialText.substr(lenTyped)}
                            </span>
                        </Typography>
                        <form 
                        className={classes.container}
                        noValidate
                        autoComplete="off"
                        >
                        <TextField
                            variant="outlined"
                            name="ksdTest"
                            id="ksdTest"
                            multiline
                            rowsMax={4}
                            label="Type the above text..."
                            fullWidth={true}
                            value={this.state.eventName}
                            onChange={e => {
                            this.handleChange(e);
                            }}
                            className={classes.textField}
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!this.state.buttonActive}
                            fullWidth
                            style={{ marginTop: "3em", marginLeft: "0" }}
                            onClick={e => {
                                this.submitHandler();
                            }}
                            className={classes.button}
                        >
                            MARK MY ATTENDANCE
                        </Button>
                        </form>
                    </Paper>
                    </Grid>
                    <Grid item xs={1} sm={3} />
                </Grid>
            </React.Fragment>
            ) : (
              <Loader />
            )}
          </React.Fragment>
        );
    }
}

AttendeeVerify.propTypes = {
    classes: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired
};

export default withStyles(styles)(withSnackbar(AttendeeVerify));
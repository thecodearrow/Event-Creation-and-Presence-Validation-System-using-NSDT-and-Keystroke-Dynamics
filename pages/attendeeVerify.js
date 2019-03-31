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
import firebase from "firebase/app";
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";
import Head from 'next/head';
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
        //TypingDNA instance
        this.tdna=""
        this.state = {
            user: '',
            location: '',
            dateTime: '',
            currentTypingPattern:'',
            attendanceStatus:false
        }
    }

    handleChange(e) {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value
        })
    }

    componentDidMount() {
        this.tdna=new TypingDNA(); //should be instantiated once typingDNA.js loads
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
                console.log("Hola",decider);
                if(decider>=75){
                    this.successNotify();
                }
                else{
                    this.failureNotify();
                }
                console.log(response);
            })
            .catch(error => console.error('Error:', error));

    
       
    }

    submitHandler() {

        const eventData = {
            ...this.state,
            user: this.state.user.email,
            currentTypingPattern:this.tdna.getTypingPattern({type:0, length:150}),
            attendanceStatus:true //to be updated based on match(tp1,tp2) and firebase retrieval status
            
        }
        console.log(eventData.currentTypingPattern);

        //Retrive Typing Pattern from Firebase for eventData.user 

        const dbTypingPattern = '142,248,242,0.3884,1.5747,0.1489,0.5426,94,148,14,51,10,1,2,6,17,0,2,5,7,0,0,6,1,9,7,3,0,6,7,11,5,2,2,0,8,0,23,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1.0209,1.1486,1.0203,0.7973,1.1415,1,0.6892,0.5845,1.0975,1,1,0.75,1.1622,0.9231,0.75,1.3041,1,0.9414,0.8716,1.3286,1.0581,1.2939,0.8514,1,1.1873,1,0.7942,1,1,1.2432,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.134,1.1277,0.9362,0.945,0.9944,1,1.0053,1.0298,0.9848,1,1,0.834,1.2234,1.0697,0.886,1.0213,1,0.9716,0.9392,0.912,0.9532,0.8989,1,1,1.0878,1,1.1448,1,1,0.9255,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.8881,0.6014,0.6757,0.777,0.9578,1,0.6622,1.0432,0.9208,1,1,0.9482,0.8649,0.8708,1.1892,1.2477,1,1.0113,0.8485,0.9742,0.9324,0.8919,1.1824,1,0.7239,1,1.3587,1,1,0.4324,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.5465,1,0.6078,0.8502,0.7335,1,0.4314,0.3952,0.7465,1,1,0.7826,1,0.8069,0.9163,1.5916,1,0.6413,0.3088,0.8655,0.3962,0.3039,0.0392,1,1.1454,1,0.7754,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.0347,1,0.1429,0.5207,0.9574,1,0.0357,1.1432,1.1306,1,1,0.3769,1,0.5882,0.713,0.7626,1,0.8275,0.8186,0.7117,1.0923,1.0357,1,1,0.7438,1,1.1185,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.9573,1,1.2353,0.6574,0.9014,1,0.3922,0.632,0.8309,1,1,0.5906,1,0.7226,0.3654,0.7045,1,0.8787,0.9256,1.0702,0.6254,0.3137,0.4902,1,0.5094,1,1.0353,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,3,0,-1,142,0,1,107,-1,0,-1,-1,23,108,16,2,113,8,2,85,11,2,0,0,1,2,1,848663921,1,1,0,0,0,1,1440,900,1,1012,73,0,2121341559';

        this.postRequestAndMatchTypingPatterns(dbTypingPattern,eventData.currentTypingPattern);


         //Snackbar Notifications => Can be DB failure, Match Failure too... Customise accordingly
        // Have handled Match Failure in  postRequestAndMatchTypingPatterns
   
    }

    render() {
        const { classes } = this.props;
        return (
          <React.Fragment>

                <Head>
                <script src="https://www.typingdna.com/scripts/typingdna.js">
                </script>  
              </Head>
            {this.state.user !== '' ? (
            <React.Fragment>
                <Navbar
                    page="Create"
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
                        variant="subtitle2"
                        component="subtitle2"
                        className={classes.head}
                        style={{ color: "midnightblue" }}
                        >
                        Please type the way you normally do. This is to ensure that you were physically present during the event and your attendance is being validated as you type
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
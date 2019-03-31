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
import TypingDnaClient from  "typingdnaclient"
import { typingDNA } from  "../lib/typingDNA_config"
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

     matchTypingPatterns(tp1,tp2){
        var apiKey = typingDNA.apiKey;
        var apiSecret = typingDNA.apiSecret;
     
        var url = "http://cors.io/?https://api.typingdna.com/match:443";
 
       var data={tp1:tp1,tp2:tp2,quality:'2'};

        (async () => {
            const rawResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
                'Authorization': 'Basic ' + new Buffer(apiKey + ':' + apiSecret).toString('base64'),
                "Access-Control-Allow-Origin": "http://localhost:3000", //CARE TO BE TAKEN!
                "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"

            },
            body: JSON.stringify(data),
             credentials: "same-origin",
            });
            const content = await rawResponse.json();
        
            console.log(content);
        })();
       
    }

    submitHandler() {
        const eventData = {
            ...this.state,
            user: this.state.user.email,
            currentTypingPattern:this.tdna.getTypingPattern({type:0, length:200}),
            attendanceStatus:true //to be updated based on match(tp1,tp2) and firebase retrieval status
            
        }
        console.log(eventData.currentTypingPattern);
        //Retrive Typing Pattern from Firebase for eventData.user 
        const dbTypingPattern="200,237,253,0.3715,1.6918,0.1596,0.5638,94,159,15,53,9,3,5,6,16,3,4,3,8,0,0,4,3,12,16,5,0,15,4,16,11,2,1,0,12,0,31,0,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.9686,1.0147,1.1195,1.0021,1.1042,1.0524,1.0582,0.5346,1.0888,1,1,0.9182,1.3753,0.9411,0.5975,1.1245,1,0.8539,1.0425,1.3324,0.9906,1.717,4.478,1,1.0524,1,0.8783,1,1.4717,0.9843,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.1359,1.2376,1.0979,1.0468,0.9787,1.117,1.0904,0.8972,0.8647,1,1,0.8989,1.1667,1.0124,0.8511,0.9574,1,1.0184,1.0532,0.9461,0.97,0.9628,1.1383,1,0.9707,1,1.0851,1,1.3936,0.9628,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.0287,1.4235,0.6226,0.9486,0.8644,0.8386,0.8365,0.9581,1.0723,1,1,0.989,0.9623,1.0503,1.1732,0.883,1,0.9584,1.174,0.808,0.8006,0.9969,0.5786,1,0.8239,1,1.2104,1,1.478,1.2327,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.7022,0.4724,0.5163,0.7696,0.6288,1.204,0.911,0.464,0.8189,1,1,0.0815,0.28,0.6363,0.4833,1.181,1,0.4842,0.9541,1.7188,0.5918,1.7358,1,1,0.9116,1,0.8821,1,1,0.7453,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.7495,1.0959,1.2687,0.3029,0.792,0.3569,1.4738,0.9065,1.0065,1,1,0.5281,0.4157,1.2757,0.5013,0.8022,1,0.5178,0.5963,0.9943,1.0865,0.7667,1,1,0.8845,1,0.7413,1,1,0.0333,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.0542,2.4603,0.8316,1.0447,0.6111,0.8091,1.246,0.6323,0.6293,1,1,0.8331,0.1111,0.5425,0.6192,0.3308,1,0.918,0.0321,0.9903,0.5519,0.0849,1,1,0.807,1,0.8663,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,3,0,-1,200,0,7,44,12,0,-1,-1,34,103,11,2,134,5,2,39,28,2,0,0,1,2,1,848663921,1,1,0,0,0,1,1440,900,1,1012,73,0,2121341559";  //hardcoded for now

        this.matchTypingPatterns(dbTypingPattern,eventData.currentTypingPattern);


         //Snackbar Notifications (Success/ Failure Notification)
         if(eventData.attendanceStatus){
            this.successNotify();
           }
           else{
               this.failureNotify();
           }
   
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
                        Please type the way you normally do. This is to ensure that you were physically present during the event and your attendance is being validated as you type.
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
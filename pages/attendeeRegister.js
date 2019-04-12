import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";

import Loader from '../components/Loading';
import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
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

class AttendeeRegister extends Component {

    constructor() {
        super();

        this.FBRef = loadFirebase()
            .firestore()
            .collection("attendees");

        //TypingDNA instance
        this.tdna=""  

        this.initialText = "Please type the way you normally do. This is to ensure that you were physically present during the event and your attendance is being validated as you type";

        this.state = {
          user: "",
          typingPattern: "", //the typing pattern of user at time of registration
          location: "",
          dateTime: "",
          hasTyped: false,
          ksdTest: "",
          KSDtested: null
        };
    }

    handleChange(e) {
        if(!(e.target.value.toLowerCase() !== this.initialText.toLowerCase().substr(0,e.target.value.length))){
            this.setState({
                ...this.state,
                [e.target.name]: e.target.value
            })
        }
    }

    componentDidMount() {

        this.tdna=new TypingDNA(); //should be instantiated once typingDNA.js loads

        loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    ...this.state,
                    user: user
                }, async () => {
                    if (await this.checkKSDRecords()) {
                        this.setState({
                            KSDtested: true
                        })
                    } else {
                        this.setState({
                            KSDtested: false
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
            location:e.target.value
        });
    } 

    successNotify(){
        const message_success="Typing Pattern Registered";

        this.props.enqueueSnackbar(message_success, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        }
        });
        
        Router.push('/choose');
    }

    failureNotify(){
        const message_failure="Registration Failed.";
        this.props.enqueueSnackbar(message_failure, { 
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        }
      });
    }

    async checkKSDRecords() {
        const res = await this.FBRef.where("user", "==", this.state.user.email)
            .get().then(function (querySnapshot) {
                if (querySnapshot.docs.length === 1) {
                    Router.push('/choose');
                    return true;
                }
                else {
                    return false;
                }
            })
            .catch(function (error) {
                Router.push('/choose');
            });
        return res;
    }

    submitHandler () {
        
        const eventData = {
            ...this.state,
            user: this.state.user.email,
            hasTyped: true, //can be made better by bounding what the user types so as to prompt errors (.getQuality() too! )
            typingPattern:this.tdna.getTypingPattern({type:0, length:150}) //typing pattern captured 
                           
            //@TODO Experiment with 0,2 to see which performs better
        }
        //console.log(eventData.typingPattern);
    

        this.FBRef.add({
            ...eventData
        }).then( (docRef) => {
                //console.log("Document written with ID: ", docRef.id);
                if (eventData.hasTyped) {
                    this.successNotify()
                }
                else {
                    this.failureNotify()
                    this.setState({
                        ksdTest: ''
                    })
                }
            }).catch(function (error) {
                console.error("Error adding document: ", error);
            });}

    render() {
        const { classes } = this.props;
        const lenTyped = this.state.ksdTest.length;
        const tester = this.initialText.substr(0, lenTyped).toLowerCase() === this.state.ksdTest.toLowerCase();
        return (
            <React.Fragment>
            { (this.state.KSDtested === false && typeof(this.state.user)!=="string") ? (
            <React.Fragment>
                
                <Navbar 
                    page="attendeeRegister" 
                    handleLogout={this.handleLogout.bind(this)} 
                    email={this.state.user.email.includes("srmuniv")}
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
                        Register Biometrics
                        </Typography>{" "}
                        <br />
                        <Typography
                        variant="h6"
                        className={classes.head}
                        >
                            <span
                                style={tester ? { color: "white", backgroundColor: 'midnightblue'} : { color : "midnightblue" }}
                            >
                                {this.initialText.substr(0,lenTyped)}
                            </span>
                            <span
                                style={{ color: "midnightblue"}}
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
                            name="ksdTest"
                            variant="outlined"
                            id="ksdTest"
                            multiline
                            rowsMax={4}
                            label="Type the above text here..."
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
                            Register
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

AttendeeRegister.propTypes = {
    classes: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired
};

export default withStyles(styles)(withSnackbar(AttendeeRegister));
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

        //TypingDNA instance
        this.tdna=""  

        this.FBRef = loadFirebase()
          .firestore()
          .collection("attendees");

        this.state = {
            user: '',
            typingPattern: '',  //the typing pattern of user at time of registration
            location: '',
            dateTime: '',
            hasTyped: false
    
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
                }
                )
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
                    this.setState({
                        ksdTest: ''
                    }, () => {
                        Router.push('/choose');
                    })
                }
                else {
                    this.failureNotify();
                    this.setState({
                        ksdTest: '',
                        hasTyped: false
                    })
                }
            }).catch(function (error) {
                console.error("Error adding document: ", error);
            });}

    render() {
        const { classes } = this.props;
        return (
        
            <React.Fragment>
            {this.state.user !== '' ? (
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
                        variant="subtitle2"
                        className={classes.head}
                        style={{ color: "midnightblue" }}
                        >
                        Please ensure you type the way you normally do. By continuing to type further, you provide consent for your current typing pattern to be logged into our database which maybe used to validate your presence in future
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
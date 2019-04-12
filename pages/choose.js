import React, { Component, useReducer } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import Button from "@material-ui/core/Button";

import Loader from "../components/Loading";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";


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
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  buttonContainer: {
    padding:'1em',
    border: '1px solid dodgerblue'
  },
  button: {
    position: 'relative',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,0%)',
    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)'
  },
  buttonInfoTypo: {
      paddingTop: '0.5em', 
      color: 'red' 
  },
  buttonLink: {
    textDecoration: 'none',
    color: 'white'
  }
});

class Choose extends Component {

    constructor() {
        super();
        this.FBRef = loadFirebase()
            .firestore()
            .collection("attendees");
        this.state = {
            user: '',
            KSDtested: null
        }
    }

    componentDidMount() {
        loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    ...this.state,
                    user: user
                }, async () => {
                    if(await this.checkKSDRecords()){
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

    async checkKSDRecords() {
        const res = await this.FBRef.where("user", "==", this.state.user.email)
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

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                {
                    (typeof(this.state.user) !== "string" && this.state.KSDtested !== null) ? (
                    <React.Fragment>
                        <Navbar 
                            page="choose" 
                            handleLogout={this.handleLogout.bind(this)} 
                            email={this.state.user.email.includes("srmuniv")}
                        />
                        <Grid
                            container
                            spacing={0}
                            direction="row"
                            alignItems="center"
                            justify="space-evenly"
                            style={{ minHeight: '90vh' }}
                        >
                        {
                            this.state.user.email.includes('srmuniv') ? 
                            ( 
                            <React.Fragment>
                                <Grid item>
                                    <Paper elevation={2} className={classes.buttonContainer}>
                                        <Button variant="contained" size="large" className={classes.button}>
                                            <a className={classes.buttonLink} href={`/create`}>Create an Event!</a>
                                        </Button>
                                            <Typography variant="subtitle1" align="center" className={classes.buttonInfoTypo}>
                                                If you plan to organize an event, pick this option.
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item>
                                    <Paper elevation={2} className={classes.buttonContainer}>
                                        <Button variant="contained" size="large" className={classes.button}>
                                            <a className={classes.buttonLink} href={`/attend`}>Attend an Event!</a>
                                        </Button>
                                        <Typography variant="subtitle1" align="center" className={classes.buttonInfoTypo}>
                                            If you have an event code, please pick this option.
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </React.Fragment>) :(
                                this.state.user.email.includes('gmail') ?
                                    (<Grid item>
                                            <Paper elevation={2} className={classes.buttonContainer}>
                                            <Button variant="contained" size="large" className={classes.button}>
                                                <a className={classes.buttonLink} href={`/attend`}>Attend an Event!</a>
                                            </Button>
                                                <Typography variant="subtitle1" align="center" className={classes.buttonInfoTypo}>
                                                If you have an event code, please pick this option.
                                            </Typography>
                                        </Paper>
                                    </Grid>): true
                            )
                        }
                    </Grid>
                </React.Fragment>) : (<Loader />)
            }
            </React.Fragment>);
    }
}

Choose.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Choose);
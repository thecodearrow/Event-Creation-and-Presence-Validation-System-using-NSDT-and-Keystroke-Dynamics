import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";


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
        this.state = {
            user: '',
            ksdTest: '',
            location: '',
            dateTime: ''
        }
    }

    handleChange(e) {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value
        })
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
            location:e.target.value
        });
    } 
    submitHandler () {
        const eventData = {
            ...this.state,
            user: this.state.user.email
        }
        //console.log(eventData);
        //make doc on firebase and send
    }

    render() {
        const { classes } = this.props;
        return (
          <React.Fragment>
            <Navbar page="Create" />
            {this.state.user !== null ? (
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
                      component="subtitle2"
                      className={classes.head}
                      style={{ color: "red" }}
                    >
                      It has survived not only five centuries, but also
                      the leap into electronic typesetting, remaining
                      essentially unchanged.
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
                        label="Keystroke Dynamics Test"
                        placeholder="A KSD test"
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
            ) : (
              true
            )}
          </React.Fragment>
        );
    }
}

AttendeeRegister.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AttendeeRegister);
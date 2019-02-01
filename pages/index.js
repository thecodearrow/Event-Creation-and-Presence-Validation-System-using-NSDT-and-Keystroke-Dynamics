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
import firebase from "firebase/app";
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
    }
});

class Login extends Component {

    static async getInitialProps({ req, query }) {
        const user = req && req.session ? req.session.decodedToken : null
        return { user }
    }

    constructor() {
        super();
        this.state = {
            user: '',
        }
    }

    componentDidMount() {

       loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({ user: user })
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
                    .then(res => {
                        console.log("Logged in!",res);
                    })
            } else {
                console.log("NOT LOGGED IN")
            }
        })

    }

    handleLogin() {
        loadFirebase().auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
    }

    handleLogout() {
        loadFirebase().auth().signOut()
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Navbar page="Login" />
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: '90vh' }}
                >
                    <Grid item xs={1} sm={4} />
                    <Grid item xs={10} sm={4}>
                        <Paper className={classes.root} elevation={2}>
                            <Typography variant="h5" component="h5" className={classes.head}>
                                Faculty Login
                            </Typography>
                            {/* <form className={classes.container} noValidate autoComplete="off">
                                <TextField
                                    name="facultyEmail"
                                    id="Faculty E-Mail"
                                    label="Faculty E-Mail"
                                    error={this.state.errEmail}
                                    placeholder="Faculty E-Mail"
                                    fullWidth={true}
                                    value={this.state.facultyEmail}
                                    onChange={(e) => { this.handleChange(e) }}
                                    className={classes.textField}
                                    margin="normal"
                                />
                                <TextField
                                    name="password"
                                    type="password"
                                    id="Password"
                                    label="Password"
                                    error={this.state.errPassword}
                                    placeholder="Password"
                                    fullWidth={true}
                                    value={this.state.password}
                                    onChange={(e) => { this.handleChange(e) }}
                                    className={classes.textField}
                                    margin="normal"
                                /> */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick = {(e) => {this.handleLogin()}}
                                    className={classes.button}
                                >
                                    Login with Google
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick = {(e) => {this.handleLogout()}}
                                    className={classes.button}
                                >
                                    Logout
                                </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={1} sm={4} />
                </Grid>
            </React.Fragment>);
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);
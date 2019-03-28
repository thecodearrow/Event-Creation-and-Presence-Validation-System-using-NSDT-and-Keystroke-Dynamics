import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import Button from "@material-ui/core/Button";

import Loader from "../components/Loading";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";

import ChirpMessenger from '../components/ChirpMessenger';

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
        padding: '1em'
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

class AttendEvent extends Component {

    static async getInitialProps({req, query, res}) {
        return {
            attendString: query
        }
    }

    constructor() {
        super();
        this.state = {
            user: ''
        }
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

    render() {
        const { classes } = this.props;
        return (
          <React.Fragment>
            {this.state.user !== '' ? (
                <React.Fragment>
                    <Navbar
                        page="AttendEvent"
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
                        <ChirpMessenger />
                    </Grid>
                </React.Fragment>
            ) : (
              <Loader />
            )}
          </React.Fragment>
        );
    }
}

AttendEvent.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AttendEvent);
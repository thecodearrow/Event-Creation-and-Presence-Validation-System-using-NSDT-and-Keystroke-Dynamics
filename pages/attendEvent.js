import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';

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
        this.FBRef = loadFirebase()
            .firestore()
            .collection("attendees");
        this.state = {
            user: '',
            eventCode: '',
            buttonDisable: true,
            KSDtested: false
        }
    }

    componentDidMount() {
        if(this.props.attendString.attendString === undefined){
            Router.push('/choose');
        } // don't allow access without attendString

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

    onSuccessRX = (chirpData) => {
        this.setState({
            eventCode: this.props.attendString.attendString + chirpData,
            buttonDisable : false
        }, () => Router.push(`/attendeeVerify?eventCode=${this.state.eventCode}`, `/attVerify/${encodeURIComponent(this.state.eventCode)}`))
    }

    async checkKSDRecords() {
        await this.FBRef.where("user", "==", this.state.user.email)
            .get().then(function (querySnapshot) {
                if (querySnapshot.docs.length === 0) Router.push('/attendeeRegister');
            })
            .catch(function (error) {
                Router.push('/attendeeRegister');
            });
        return true;
    }

    handleLogout() {
        loadFirebase().auth().signOut()
    }

    render() {
        const { classes } = this.props;
        return (
          <React.Fragment>
            {this.state.user !== '' && this.state.KSDtested && this.props.attendString.attendString !== undefined ? (
                <React.Fragment>
                    <Navbar
                        page="attendEvent"
                        email={this.state.user.email.includes("srmuniv")}
                        handleLogout={this.handleLogout.bind(this)}
                    />
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: "90vh" }}
                    >
                        <ChirpMessenger onSuccessRX={this.onSuccessRX.bind(this)}/>
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
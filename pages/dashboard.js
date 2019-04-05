import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';


import Loader from "../components/Loading";
import ClassCard from "../components/ClassCard";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";
import { Typography } from '../node_modules/@material-ui/core';

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

class Dashboard extends Component {

    constructor() {
        super();
        this.FBRef = loadFirebase()
          .firestore()
          .collection("events");
        this.FBRefAtt = loadFirebase()
            .firestore()
            .collection("attendees");
        this.state = {
            user: '',
            eventList: []
        }
    }

    async componentDidMount() {
        let that = this;
        await loadFirebase().auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    ...this.state,
                    user: user
                },
                async () => {
                    if (await this.checkKSDRecords()) {
                            this.setState({
                                KSDtested: true
                            })
                    }
                    let eventList =[];
                    await this.FBRef.where("organizer_email","==",this.state.user.email)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            eventList.push({id:doc.id,data:doc.data()})
                        });
                    })
                    .catch(function (error) {
                        console.log("Error getting documents: ", error);
                    })
                    this.setState({
                        eventList
                    })
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
                //this.handleLogout();
                window.location = `http://${window.location.host}/`;
            }
        })
    }

    async checkKSDRecords() {
        await this.FBRefAtt.where("user", "==", this.state.user.email)
            .get().then(function (querySnapshot) {
                if(querySnapshot.docs.length === 0) Router.push('/attendeeRegister');
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
                {this.state.user !== '' && this.state.KSDtested ? (
                    <React.Fragment>
                        <Navbar
                            page="dashboard"
                            email={this.state.user.email.includes("srmuniv")}
                            handleLogout={this.handleLogout.bind(this)}
                        />
                        <Typography
                            variant="h2"
                            style={{textAlign:'center',marginTop:'15vh'}}
                        >
                            Events You have Created
                        </Typography>
                        <Grid
                            container
                            spacing={0}
                            direction="row"
                            alignItems="center"
                            justify="space-evenly"
                            style={{ minHeight: "50vh" }}
                        >
                        {
                            this.state.user.email/*.includes("srmuniv")*/ ? this.state.eventList.length > 0 ? this.state.eventList.map( (el,i) => (
                                <Grid key={i} item>
                                    <ClassCard key={i} eventCode={el.id} eventName={el.data.eventName} eventStart={el.data.startDate} eventEnd={el.data.endDate} />
                                </Grid>
                            )) : (
                                <Typography variant="h2"> You have not created any events, yet </Typography> 
                            ): true
                        }
                        </Grid>
                    </React.Fragment>
                ) : (
                        <Loader />
                    )}
            </React.Fragment>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
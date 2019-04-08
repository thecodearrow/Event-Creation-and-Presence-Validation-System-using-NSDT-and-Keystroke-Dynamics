import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import Button from '@material-ui/core/Button';

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
    button: {
        margin: theme.spacing.unit,
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
            eventList: [],
            upcoming: false,
            passed: false
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
        const currDate = new Date().toLocaleString('en-GB');
        return (
          <React.Fragment>
            {this.state.user !== "" && this.state.KSDtested ? (
              <React.Fragment>
                <Navbar
                  page="dashboard"
                  email={this.state.user.email.includes("srmuniv")}
                  handleLogout={this.handleLogout.bind(this)}
                />
                <Typography
                  variant="h2"
                  style={{
                    textAlign: "center",
                    marginTop: "15vh",
                    marginBottom: "6vh"
                  }}
                >
                  Events You have Created
                </Typography>
                <Grid
                  container
                  spacing={0}
                  direction="row"
                  justify="space-evenly"
                  alignContent="space-around"
                >
                  <Grid item>
                    <Typography inline variant="subtitle2">
                        FILTER BY:
                    </Typography>
                    <Button
                        color="primary"
                        disabled={!(this.state.upcoming || this.state.passed)}
                        onClick={
                            (e) => {
                                this.setState({
                                    upcoming: false,
                                    passed: false
                                })
                            }
                        }
                        className={classes.button}>
                        ALL
                    </Button>
                    <Button 
                        color="primary"
                        disabled={this.state.upcoming}
                        onClick={
                          (e) => {
                              this.setState({
                                  passed: false,
                                  upcoming: true
                              })
                          }
                      } 
                        className={classes.button}>
                        UPCOMING
                    </Button>
                    <Button
                      color="secondary"
                      disabled={this.state.passed}
                      className={classes.button}
                      onClick={
                          (e) => {
                              this.setState({
                                  upcoming:false,
                                  passed: true
                              })
                          }
                      }
                    >
                      PASSED
                    </Button>
                    <Button
                      href="/create"
                      color="primary"
                      variant="contained"
                      className={classes.button}
                    >
                      CREATE NEW +
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={0}
                  direction="row"
                  alignItems="baseline"
                  justify="space-evenly"
                  style={{ minHeight: "50vh", marginTop: "4vh" }}
                >
                  {this.state.user.email /*.includes("srmuniv")*/ ? (
                    this.state.eventList.length > 0 ? (
                      this.state.eventList
                        .sort( (el1,el2) => {
                            return (
                              new Date(
                                el2.data.startDate
                              ) -
                              new Date(
                                el1.data.startDate
                              )
                            );
                        })
                        .filter( (el) => {
                            if(this.state.upcoming){
                                return el.data.startDate >= currDate
                            } else if(this.state.passed){
                                return el.data.endDate <= currDate
                            } 
                            return true
                        })
                        .map((el, i) => (
                        <Grid key={i} item>
                          <ClassCard
                            key={i}
                            bgCol={el.data.endDate <= currDate}
                            eventCode={el.id.substr(0, 6)}
                            eventName={el.data.eventName}
                            eventStart={el.data.startDate}
                            eventEnd={el.data.endDate}
                          />
                        </Grid>
                      ))
                    ) : (
                        <Typography variant="h2">
                            You have not created any events, yet
                        </Typography>
                    )
                  ) : (
                    true
                  )}
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
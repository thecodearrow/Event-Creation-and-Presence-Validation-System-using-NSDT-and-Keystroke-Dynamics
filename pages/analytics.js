import React, { Component } from 'react';

import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import RollTable from '../components/Table';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import Divider from '@material-ui/core/Divider';

import { loadFirebase } from '../lib/firebase_client';

import "firebase/auth";
import Router from 'next/router';

import Loader from '../components/Loading';

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
    mainHeader: {
        textTransform: 'uppercase',
        textAlign: 'center',
        transform: 'translateY(5vh)'
    },
    sub1Header: {
        marginTop: '5rem',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    },
    sub2Header: {
        color: 'grey',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    },
    divider: {
        width: '80%',
        transform: 'translateX(12%)'
    },
    grid: {
        flexGrow: 1,
        marginTop: '5vh',
        minHeight: '60vh'
    }
});

class Attendance extends Component {
  constructor() {
    super();
    this.FBRef = loadFirebase()
        .firestore()
        .collection("events");
    this.state = {
        user: '',
        eventCode: window.location.href.split("/").pop()
    }
  }

  async componentDidMount() {
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
      await this.FBRef.doc(this.state.eventCode)
          .get()
          .then( doc => {
              this.setState({
                  eventName: doc.data().eventName,
                  location: doc.data().location,
                  endDate: doc.data().endDate,
                  startDate: doc.data().startDate,
                  mode: doc.data().mode
              })
          })
          .catch(function (error) {
              console.log("Error getting documents: ", error);
          })
  }

  handleLogout() {
    loadFirebase()
      .auth()
      .signOut();
  }

  render() {
    const { classes } = this.props;

    return (
        <React.Fragment>
            {
                this.state.user === '' ? <Loader /> : 
                (<React.Fragment>
                    <Navbar 
                        page="analytics"
                        email={this.state.user.email.includes("srmuniv")}
                        handleLogout={this.handleLogout.bind(this)}
                    />
                    <Typography
                    component="h3"
                    variant="h3"
                    gutterBottom
                    className={classes.mainHeader}
                    >
                    {this.state.eventName} @ {this.state.location}
                    </Typography>
                    <Typography
                    component="h5"
                    variant="h5"
                    gutterBottom
                    className={classes.sub1Header}
                    >
                    From - {this.state.startDate !== undefined ? this.state.startDate.toLocaleString().substr(0,17):true}<br/> 
                    To - {this.state.startDate !== undefined ? this.state.endDate.toLocaleString().substr(0,17):true}
                    </Typography>
                    <Typography
                    component="h6"
                    variant="h6"
                    gutterBottom
                    className={classes.sub2Header}
                    >
                    {this.state.mode === "STRICT" ? "Keystroke Biometrics are used to authenticate attendees" : 
                    "No Biometrics will be enforced"}
                    </Typography>
                    <Divider className={classes.divider} />
                    <Grid
                    className={classes.grid}
                    container
                    spacing={0}
                    justify="space-around"
                    >
                        <Grid item>
                            <RollTable
                                eventCode={this.state.eventCode}
                            />
                        </Grid>
                    </Grid>
                </React.Fragment>) 
            } 
        </React.Fragment>
    );
  }
}

Attendance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Attendance);
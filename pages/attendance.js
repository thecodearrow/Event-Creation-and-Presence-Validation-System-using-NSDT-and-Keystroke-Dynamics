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
    this.state = {
        user: ''
    }
  }

//   static async getInitialProps({ req,res,query }) {
//         return {
//             query,
//             dayIndex: new Date().toString().substring(3,15)
//         }
//     }

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
                    (
                    <React.Fragment>
                    <Navbar page="Attendance" handleLogout={this.handleLogout.bind(this)} />
                    <Typography
                    component="h3"
                    variant="h3"
                    gutterBottom
                    className={classes.mainHeader}
                    >
                    {}
                    </Typography>
                    <Typography
                    component="h5"
                    variant="h5"
                    gutterBottom
                    className={classes.sub1Header}
                    >
                    {``}
                    </Typography>
                    <Typography
                    component="h6"
                    variant="h6"
                    gutterBottom
                    className={classes.sub2Header}
                    >
                    {``}
                    </Typography>
                    <Divider className={classes.divider} />
                    <Grid
                    className={classes.grid}
                    container
                    spacing={0}
                    justify="space-around"
                    >
                        <Grid item>
                            {/* <RollTable
                                dayIndex={t}
                                courseCode={}
                                tdata={}
                            /> */}
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
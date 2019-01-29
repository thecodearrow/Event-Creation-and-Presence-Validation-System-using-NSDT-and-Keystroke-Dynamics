import React, { Component } from 'react';
import ChirpConnect from "chirp-js-sdk";

import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import RollTable from '../components/Table';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import Divider from '@material-ui/core/Divider';

import { loadFirebase } from '../lib/db.js';

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
        minHeight: '100vh'
    }
});

class Attendance extends Component {
    constructor() {
        super();
    }

    static async getInitialProps({req,query}){
        return {
            query
        }
    }

    componentDidMount() {
        // const chirp = new ChirpConnect("FA3baAfbDBc9E2E9a8A352536");
        // const payload = new Uint8Array([1, 2, 3, 4])
        // chirp.send(payload, err => err ?
        //     console.error("An error occured") :
        //     true
        // )
    }

    render() {
        const { classes } = this.props;
        const courseDetails = {
            ...this.props.query
        }

        const numberOfDays = Math.floor(((new Date(courseDetails.date).getTime()-new Date(2019,0,30).getTime())/(24*60*60*1000)));

        return (
        <React.Fragment>
            <Navbar page="Attendance" />
            <Typography
                component="h3"
                variant="h3"
                gutterBottom
                className={classes.mainHeader}
            >
            {courseDetails.name}
            </Typography>
            <Typography
                component="h5"
                variant="h5"
                gutterBottom
                className={classes.sub1Header}
            >
            {`${courseDetails.code.substr(0,6)} | section - ${courseDetails.code.substr(7,)}`}
            </Typography>
            <Typography
                component="h6"
                variant="h6"
                gutterBottom
                className={classes.sub2Header}
            >
            {`Semester ${courseDetails.sem} | Year ${courseDetails.year}`}
            </Typography>
            <Divider className={classes.divider} />
            <Grid
                className={classes.grid}
                container
                spacing={0}
                justify="space-around"
            >
            <Grid item>
                <RollTable dayIndex={numberOfDays} courseCode={courseDetails.code} tdata={this.props.courses} />
            </Grid>
            </Grid>
        </React.Fragment>
        );
    }
}

Attendance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Attendance);
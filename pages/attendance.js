import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import RollTable from '../components/Table';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import ChirpConnect from "chirp-js-sdk";
import Divider from '@material-ui/core/Divider';

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
        marginTop: '5vh'
    }
});

class Attendance extends Component {
    constructor() {
        super();
    }

    static async getInitialProps(context) {
        const course = context.query;
        return { course }
    }

    createData = (regNo, name, present) => {
        return { regNo, name, present };
    }

    rows = [
        this.createData("RA1511008010127", "Warren White", false),
        this.createData("RA1511008010125", "Mohammed Moiz", false),
        this.createData('RA1511008010148', 'Prashanth Vaidya', false),
        this.createData('RA1511008010136', 'Vasu Garg', false)
    ];

    componentDidMount() {
        const chirp = new ChirpConnect("FA3baAfbDBc9E2E9a8A352536");
        const payload = new Uint8Array([1, 2, 3, 4])
        chirp.send(payload, err => err ?
            console.error("An error occured") :
            true
        )
    }

    render() {
        const { classes } = this.props;
        const course = this.props.course;
        return <React.Fragment>
            <Navbar page="Attendance" />
            <Typography component="h2" variant="h2" gutterBottom className={classes.mainHeader}>
              {course.code}
            </Typography>
            <Typography component="h5" variant="h5" gutterBottom className={classes.sub1Header}>
              {course.name}
            </Typography>
            <Typography component="h6" variant="h6" gutterBottom className={classes.sub2Header}>
              Semester {course.sem} | {course.year}
            </Typography>
            <Divider className={classes.divider} />
            <Grid className={classes.grid} container spacing={0} justify="space-around">
              <Grid item>
                <RollTable tdata={this.rows} />
              </Grid>
            </Grid>
          </React.Fragment>;
    }
}

Attendance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Attendance);
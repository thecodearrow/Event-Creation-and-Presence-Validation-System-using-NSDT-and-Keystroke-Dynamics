import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import ClassCard from '../components/ClassCard';
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
        textAlign:'center',
        transform: 'translateY(5vh)'
    },
    subHeader: {
        marginTop: '5rem',
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
        padding: '0 5rem'
    }
});

class Dashboard extends Component {
    constructor() {
        super();
        this.state = {
            facultyEmail: '',
            password: ''
        }
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    render() {
        const { classes } = this.props;
        return <React.Fragment>
            <Navbar page="Dashboard" />
            <Typography component="h2" variant="h2" gutterBottom className={classes.mainHeader}>
              Welcome!
            </Typography>
            <Typography component="h5" variant="h5" gutterBottom className={classes.subHeader}>
              Classes for today
            </Typography>
            <Divider className={classes.divider} />
            <Grid className={classes.grid} container spacing={24} justify="space-around">
              <Grid item>
                <ClassCard courseCode="IT303J" courseName="Computer Networks" semester="2" year="2019" students={24}/>
              </Grid>
              <Grid item>
                <ClassCard courseCode="IT402J" courseName="Integrative Programming & Technology" semester="7" year="2019" students={54}/>
              </Grid>
              <Grid item>
                <ClassCard courseCode="IT301J" courseName="Operating Systems" semester="5" year="2019" students={67}/>
              </Grid>
              <Grid item>
                <ClassCard courseCode="IT302J" courseName="Database Management Systems" semester="5" year="2019" students={45}/>
              </Grid>
            </Grid>
          </React.Fragment>;
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
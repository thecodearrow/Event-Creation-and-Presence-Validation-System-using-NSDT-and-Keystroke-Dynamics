import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import ClassCard from '../components/ClassCard';
import Divider from '@material-ui/core/Divider';

import "firebase/auth";
import Router from 'next/router';
import { loadFirebase } from '../lib/firebase_client';
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
        padding: '0 5rem',
        minHeight: '110%'
    }
});

class Dashboard extends Component {
    static async getInitialProps({req, query, res}){

        let courses = []
        let result = await loadFirebase()
            .firestore()
            .collection('courses')
            .get()
            .then(results =>
                results.forEach(doc => {
                    courses.push({
                        courseCode: doc.id,
                        ...doc.data()
                    })
                })
            )

        return {
            courses
        }
    }

    constructor() {
        super();
        this.state = {
            courses: [],
            user: ''
        }
    }

    componentDidMount(){
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
            {   this.state.user !== '' ?
                (   <React.Fragment>
                        <Navbar page="Dashboard" handleLogout={this.handleLogout.bind(this)} />
                        <Typography component="h4" variant="h4" gutterBottom className={classes.mainHeader}>
                            Welcome<em>{`, ${this.state.user.displayName}`}</em>
                        </Typography>

                        <Typography component="h5" variant="h5" gutterBottom className={classes.subHeader}>
                            Your Events
                        </Typography>
                        <Divider className={classes.divider} />
                        <Grid className={classes.grid} container spacing={24} justify="space-around">
                            {
                                this.props.courses.length > 1 ? this.props.courses.map( (course,index) => (
                                <Grid item key={index}>
                                    <ClassCard 
                                        courseCode={course.courseCode} 
                                        courseName={course.courseName} 
                                        semester={course.semester} 
                                        year={course.year}   
                                        students={course.students.length}
                                        facultyName={course.facultyName}
                                    />
                                </Grid>)) : true
                            }
                        </Grid>
                    </React.Fragment>
                    ) : 
                    <Loader />
            }
        </React.Fragment>);
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
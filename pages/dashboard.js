import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import ClassCard from '../components/ClassCard';
import Divider from '@material-ui/core/Divider';

import firebase from "firebase/app";
import "firebase/auth";
import { loadFirebase } from '../lib/firebase_client';

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
    constructor() {
        super();
        this.state = {
            user: '',
        }
    }

    static async getInitialProps({req, query}){
        const user = req && req.session ? req.session.decodedToken : null;
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
            courses,
            user
        }
    }


    async componentDidMount() {
        console.log(await loadFirebase().auth().currentUser);
    }

    handleLogout() {
        loadFirebase().auth().signOut()
    }

    render() {
        const { classes } = this.props;
        return (<React.Fragment>
            <Navbar page="Dashboard" handleLogout={this.handleLogout.bind(this)}/>
            {   this.state.user !== null || this.state.user !== undefined ?
                (   <React.Fragment>
                        <Typography component="h4" variant="h4" gutterBottom className={classes.mainHeader}>
                            Welcome<em>{`, ${this.props.courses[0].facultyName}`}</em>
                        </Typography>

                        <Typography component="h5" variant="h5" gutterBottom className={classes.subHeader}>
                            Classes for Today
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
                    true
            }
        </React.Fragment>);
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";

import { loadFirebase } from '../lib/firebase_client';
import Router from 'next/router';
import "firebase/auth";
import "isomorphic-unfetch";


const styles = theme => ({
    head: {
        textAlign: 'center'
    },
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    instructions: {
        textAlign: 'center',
        fontWeight: '200',
        color: 'red'
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    button: {
        marginTop: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit
    }
});

class Attend extends Component {

    constructor() {
        super();
        this.state = {
            user: '',
            eventCode:'',
            formError: false
        }
    }

    handleChange(e) {
        if(e.target.value.length <= 6){
            this.setState({
                ...this.state,
                formError:false,
                eventCode: e.target.value
            })
        }
        else{
            this.setState({
                ...this.state,
                eventCode: e.target.value,
                formError: true
            })
        }
    }

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
        loadFirebase().auth().signOut()
    }

    handleValidate() {
        // check if db doc exists and timeout on doc
        document.location += 'Event?attendString=jbsvjb';
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Navbar page="Attend" />
                {
                    this.state.user !== null ? (
                        <Grid
                            container
                            spacing={0}
                            direction="column"
                            alignItems="center"
                            justify="center"
                            style={{ minHeight: '90vh' }}
                        >
                            <Grid item xs={1} sm={4} />
                            <Grid item xs={10} sm={4}>
                                <Paper className={classes.root} elevation={2}>
                                    <Typography variant="subtitle1" className={classes.head}>
                                       Enter the 6-digit Event Code
                                    </Typography>
                                    <form className={classes.container} noValidate autoComplete="off">
                                        <TextField
                                            variant="outlined"
                                            name="eventCode"
                                            id="eventCode"
                                            label="Event Code"
                                            error={this.state.formError}
                                            placeholder="Event Code"
                                            fullWidth={true}
                                            value={this.state.eventCode}
                                            onChange={(e) => { this.handleChange(e) }}
                                            className={classes.textField}
                                            margin="normal"
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            style={{ marginTop: '3em', marginLeft: '0' }}
                                            onClick={(e) => { this.handleValidate() }}
                                            className={classes.button}
                                            disabled={!(this.state.eventCode.length === 6)}
                                        >
                                            Validate
                                        </Button>
                                    </form>
                                </Paper>
                            </Grid>
                            <Grid item xs={1} sm={4} />
                        </Grid>) : true
                }
            </React.Fragment>);
    }
}

Attend.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Attend);
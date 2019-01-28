import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Navbar from '../components/Navbar';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";

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
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    button: {
        marginTop: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit
    }
});

class Login extends Component {
    constructor() {
        super();
        this.state = {
            facultyEmail: '',
            password: '',
            errEmail: false,
            errPassword: false
        }
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    verifyEmail = () => {
        let emailREGEX =  /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(ktr.srmuniv)\.ac.in$/g
        return (emailREGEX.test(this.state.facultyEmail));
    } 

    handleSubmit = (event) => {
        event.preventDefault();
        let pErrFlag = this.state.password.length < 8;
        let eErrFlag = !this.verifyEmail();
        if(eErrFlag || pErrFlag){
            this.setState({
                facultyEmail: eErrFlag ? '' : this.state.facultyEmail,
                password: pErrFlag ? '' : this.state.password,
                errEmail: eErrFlag,
                errPassword: pErrFlag
            })
        }
        else{
            //make auth req
            window.location.href += "dashboard"
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Navbar page="Login" />
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
                            <Typography variant="h5" component="h5" className={classes.head}>
                                Faculty Login
                            </Typography>
                            <form className={classes.container} noValidate autoComplete="off">
                                <TextField
                                    name="facultyEmail"
                                    id="Faculty E-Mail"
                                    label="Faculty E-Mail"
                                    error={this.state.errEmail}
                                    placeholder="Faculty E-Mail"
                                    fullWidth={true}
                                    value={this.state.facultyEmail}
                                    onChange={(e) => { this.handleChange(e) }}
                                    className={classes.textField}
                                    margin="normal"
                                />
                                <TextField
                                    name="password"
                                    type="password"
                                    id="Password"
                                    label="Password"
                                    error={this.state.errPassword}
                                    placeholder="Password"
                                    fullWidth={true}
                                    value={this.state.password}
                                    onChange={(e) => { this.handleChange(e) }}
                                    className={classes.textField}
                                    margin="normal"
                                />
                                <Button
                                    variant="contained"
                                    href="#contained-buttons"
                                    color="primary"
                                    onClick = {(e) => {this.handleSubmit(e)}}
                                    className={classes.button}
                                >
                                    Login
                                </Button>
                            </form>
                        </Paper>
                    </Grid>
                    <Grid item xs={1} sm={4} />
                </Grid>
            </React.Fragment>);
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);
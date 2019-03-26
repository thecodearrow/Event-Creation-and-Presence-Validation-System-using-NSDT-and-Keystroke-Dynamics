import React, { Component } from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import "firebase/auth";
import "isomorphic-unfetch";

import { CHIRP_API_KEY } from "../lib/chirp_config";

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
    buttonContainer: {
        padding: '1em'
    },
    button: {
        position: 'relative',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%,0%)',
        background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)'
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

class ChirpMessenger extends Component {

    constructor() {
        super();
        this.sdk = null;
        this.state = {
            started: false,
            waiting: false,
            receiving: false,
            received: '',
            disabled: false
        }
    }

    toAscii(payload) {
        let str = ''
        for (let i = 0; i < payload.length; i++) {
            str += String.fromCharCode(payload[i])
        }
        return str
    }

    async startSDK() {
        try{
            const chirp = await import('../node_modules/chirpsdk/index');
            const { Chirp } = chirp;
            this.sdk = await Chirp({
                    key: CHIRP_API_KEY,
                    onReceiving: () => {
                        console.log('Receving Data');
                        this.setState({
                            ...this.state,
                            waiting: false,
                            receiving: true,
                            disabled: true
                        })
                    },
                    onReceived: data => {
                        console.log("Received Data",data);
                        if (data.length > 0) {
                            this.setState({
                                ...this.state,
                                receiving: false,
                                received: "Your Presence is validated!",
                                disabled: false
                            })
                        } else {
                            this.setState({
                                ...this.state,
                                received: `I didn't hear that. Try turning the volume up?`,
                                disabled: false
                            })
                        }
                    }
                })
            } catch (err){
                console.log(err);
            }
            this.setState({
                ...this.state,
                started: true
            })
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            waiting: true
        })
        this.startSDK();
    }

    componentWillUnmount() {
        this.sdk.stop();
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Grid
                    container
                    spacing={0}
                    direction="row"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: '90vh' }}
                >
                    <Typography variant="h1">
                        {
                            this.state.waiting ? "Waiting for code..." : (this.state.receiving ? "Receiving code..." : (this.state.received ? this.state.received : "Mounting..."))
                        }
                    </Typography> <br />
                </Grid>
            </React.Fragment>
        )
    }
}

ChirpMessenger.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChirpMessenger);
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Navbar from '../components/Navbar'
import Button from '@material-ui/core/Button'

import { loadFirebase } from '../lib/firebase_client'
import firebase from 'firebase/app'
import Router from 'next/router'
import 'firebase/auth'
import 'isomorphic-unfetch'
import Loading from '../components/Loading'

const styles = theme => ({
  head: {
    textAlign: 'center',
  },
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  instructions: {
    textAlign: 'center',
    fontWeight: '200',
    color: 'red',
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
    marginLeft: theme.spacing.unit,
  },
})

class Login extends Component {
  static async getInitialProps({ req, res, query }) {
    const user = req && req.session ? req.session.decodedToken : null
    return { user }
  }

  constructor(props) {
    super(props)
    this.state = {
      user: null,
    }
  }

  componentDidMount() {
    if (this.props.user) {
      this.setState(
        {
          user: this.props.user,
        },
        () => Router.push('/choose')
      )
    }
    loadFirebase()
      .auth()
      .onAuthStateChanged(user => {
        if (user) {
          Router.push('/choose')
        }
      })
  }

  handleLogin() {
    let provider = new firebase.auth.GoogleAuthProvider()
    // provider.setCustomParameters({
    //     hd: "srmuniv.edu.in" // change to ktr.srmuniv.ac.in, later
    // });
    loadFirebase()
      .auth()
      .signInWithRedirect(provider)
  }

  handleLogout() {
    loadFirebase()
      .auth()
      .signOut()
  }

  render() {
    const { classes } = this.props
    return (
      <React.Fragment>
        {!this.state.user && !this.props.user ? (
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
                  <Typography
                    variant="h5"
                    component="h5"
                    className={classes.head}
                  >
                    Google OAuth Login
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    className={classes.instructions}
                  >
                    (Organizers, please use your official SRM Email-ID)
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '2em', marginLeft: '0' }}
                    onClick={e => {
                      this.handleLogin()
                    }}
                    className={classes.button}
                  >
                    Login with Google
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={1} sm={4} />
            </Grid>
          </React.Fragment>
        ) : (
          <Loading />
        )}
      </React.Fragment>
    )
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Login)

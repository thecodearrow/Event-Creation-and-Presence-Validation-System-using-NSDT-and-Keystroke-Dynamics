import React from 'react';
import PropTypes from 'prop-types';
import { withStyles,withTheme } from '@material-ui/core/styles';
import Link from 'next/link';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from "@material-ui/core/Button";

const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1,
    letterSpacing: '0.2em'
  },
  nav: {
    background: "linear-gradient(60deg, #21cbf3 65%, #2196f3 35%)"
  },
  button: {
      margin: '0 0.3em'
  }
};
function NavBar(props) {
    const { classes } = props;
    const page = props.page === "Login" ? '' : props.page; 
    const link = (page === "Login" || page === "Logout" ? '' : page)
    const whiteListForDashboard = ["create","choose","attend"];
    return <div className={classes.root}>
        <AppBar position="static" className={classes.nav}>
          <Toolbar>
            <Typography variant="h6" color="inherit" className={classes.flex}>
                    <em>Chirp Events</em>
            </Typography>
                {   page === '' ? '' : whiteListForDashboard.includes(page) ? ( (page === "choose" || page === "attend") && props.email ?
                    (<React.Fragment>
                        <Link href={`/dashboard`}>
                            <Button aria-label="dashboard"variant="outlined" className={classes.button}  color="inherit">
                                dashboard
                            </Button>
                        </Link> 
                    <Link href={`/${link}`}>
                        <Button aria-label={page} onClick={(e) => props.handleLogout()} variant="outlined" className={classes.button} color="inherit">
                            Logout
                        </Button>
                    </Link> 
                </React.Fragment>) : (
                    <Link href={`/${link}`}>
                        <Button aria-label={page} onClick={(e) => props.handleLogout()} variant="outlined" className={classes.button} color="inherit">
                            Logout
                        </Button>
                    </Link> 
                )) :
                (<Link href={`/${link}`}>
                    <Button aria-label={page} onClick={(e) => props.handleLogout()} variant="outlined" className={classes.button} color="inherit">
                        Logout
                    </Button>
                </Link> )
            }
          </Toolbar>
        </AppBar>
      </div>;
}

NavBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withTheme()(withStyles(styles)(NavBar));

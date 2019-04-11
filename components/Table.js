import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import firebase from 'firebase/app';
import { loadFirebase } from "../lib/firebase_client";

const styles = theme => ({
    root: {
        width: '80vw',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto'
    }
});


class StudentTable extends Component {
  constructor() {
    super();
    this.FBRef = loadFirebase().firestore().collection("events");
    this.state = {
        eventAttendees: []
    }
  }
  
  componentDidMount() {
    this.unsubscribe = this.FBRef.doc(this.props.eventCode)
    .onSnapshot(
      snap => {
        this.setState({
          eventAttendees: snap.data().attendees
        })
      },
      err => {
        console.error(err);
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { classes } = this.props;

    let received = this.state.eventAttendees.length > 0;
    
    return (
      <React.Fragment>
        <Typography
          variant="h4"
          align="center"
        >
          [LIVE!] Attendee Count - <span style={{color:'dodgerblue'}}>{this.state.eventAttendees.length}</span>
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell align="left">Serial No.</TableCell>
                <TableCell align="left">E-Mail ID</TableCell>
                <TableCell align="left">Present</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!received ? (
                <TableRow />
              ) : (
                this.state.eventAttendees.map((attendee, ind) => (
                  <TableRow key={ind}>
                    <TableCell
                      style={{
                        color: 'darkred'
                      }}
                      align="left"
                      component="th"
                      scope="row"
                    >
                      {ind+1}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "darkblue"
                      }}
                      component="th"
                      scope="row"
                    >
                      {attendee}
                    </TableCell>
                    <TableCell
                      style={{
                        textTransform: "uppercase",
                        color: "darkgreen"
                      }}
                      align="left"
                    >
                      TRUE
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}


StudentTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentTable);

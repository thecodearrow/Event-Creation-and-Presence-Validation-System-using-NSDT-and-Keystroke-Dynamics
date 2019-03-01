import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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
    this.FBRef = loadFirebase().firestore().collection('courses');
    this.state = {
      courses: []
    }
  }
  
  componentDidMount() {
    this.unsubscribe = this.FBRef.onSnapshot( (snap) => {
        var courses = [];
        snap.docChanges().forEach( (docChange,index) => {
          switch(docChange.type){

            case 'added': {
              courses.push({
                id: docChange.doc.id,
                ...docChange.doc.data()
              });
              break;
            }

            case 'modified': {
              let localCourseList = this.state.courses;          
              if(docChange.doc.id === this.props.courseCode){
                courses = localCourseList.map( course => {
                  if(course.id === docChange.doc.id){
                    return {
                      id: docChange.doc.id,
                      ...docChange.doc.data()
                    }
                  }
                  return course;
                })
              }
              break;
            }

            default: {
              courses = this.state;
            }

          }
        }
      )
      this.setState({
        courses
      })
    }, err => {
      console.error(err);
    })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { classes } = this.props;

    let received = this.state.courses.length > 1;

    let courseIndex = this.state.courses.reduce( (reqIndex,course,currIndex,arr) => {
      if(course.id === this.props.courseCode){
        return currIndex+reqIndex;
      }
      return reqIndex+0;
    },0)
    
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Register No.</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Present</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { !received ? (<TableRow />) : this.state.courses[courseIndex].students.map((student, id) => (
              <TableRow key={id}>
                <TableCell
                  style={{
                    color: student.present[this.props.dayIndex] ? "green" : "red",
                    textTransform: "uppercase"
                  }}
                  component="th"
                  scope="row"
                >
                  {student.register}
                </TableCell>
                <TableCell
                  style={{
                    color: student.present[this.props.dayIndex] ? "green" : "red",
                    textTransform: "uppercase"
                  }}
                  align="left"
                >
                  {student.name}
                </TableCell>
                <TableCell
                  style={{
                    color: student.present[this.props.dayIndex] ? "green" : "red",
                    textTransform: "uppercase"
                  }}
                  align="left"
                >
                  { (String(student.present[this.props.dayIndex]) === 'undefined') ? 
                      'Waiting' : 
                      String(student.present[this.props.dayIndex]) 
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}


StudentTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentTable);

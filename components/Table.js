import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
    root: {
        width: '80vw',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
    }
});


function SimpleTable(props) {
    const { classes } = props;

    return <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Register No.</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Present</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.tdata.map((row,id) => <TableRow key={id}>
                <TableCell style={{ color: props.tdata.fat ? 'green':'red', textTransform:'uppercase'}} component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell style={{ color: row.fat ? 'green':'red' , textTransform:'uppercase'}} align="left">{row.calories}</TableCell>
                <TableCell style={{ color: row.fat ? 'green':'red' , textTransform:'uppercase'}} align="left">{String(row.fat)}</TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </Paper>;
}

SimpleTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTable);

import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Router from 'next/router';

const styles = {
    card: {
        minWidth: 275,
        maxWidth: 300
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    }
};

function ClassCard(props) {
    const { classes } = props;

    return <Card className={classes.card}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {props.courseCode.substr(0,6)}
          </Typography>
          <Typography variant="h5" component="h2">
            {props.courseName}
          </Typography>
          <Typography className={classes.pos} color="textSecondary" >
            {`Semester ${props.semester} | ${props.year}`}
          </Typography>
          <Typography component="p">{props.students} students</Typography>
        </CardContent>
        <CardActions>
            <Link href={{
                pathname: '/attendance',
                query: {
                    code: props.courseCode,
                    name: encodeURIComponent(props.courseName),
                    sem: props.semester,
                    year: props.year
                }
            }}>
                <Button size="small" color="primary">
                    Take attendance
                </Button>
            </Link>
        </CardActions>
      </Card>;
}

ClassCard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ClassCard);
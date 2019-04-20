import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Delete from '@material-ui/icons/Delete'
import AlertDialog from './AlertDialogSlider'
import { CHIRP_API_KEY } from '../lib/chirp_config'

import Router from 'next/router'

const styles = {
  card: {
    minWidth: 320,
    maxWidth: 600,
    border: 'solid 1px dodgerblue',
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
    marginTop: 12,
    marginBottom: 6,
    color: 'darkred',
    fontSize: '1.1em',
  },
}

class ClassCard extends React.Component {
  constructor() {
    super()
    this.sdk = ''
    this.state = {
      modalOpen: false,
      dialogOpen: false,
    }
  }

  toggleDialog() {
    this.setState({
      dialogOpen: !this.state.dialogOpen,
    })
  }

  agreeCB() {
    this.setState(
      {
        dialogOpen: false,
      },
      () => {
        this.sdk({ key: `${CHIRP_API_KEY}` })
          .then(sdk => {
            sdk.send(this.props.eventCode.substr(6))
          })
          .catch(console.error)
      }
    )
  }

  async componentDidMount() {
    const chirp = await import('../node_modules/chirpsdk/index')
    const { Chirp } = chirp
    this.sdk = Chirp
  }

  render() {
    const { classes } = this.props
    const currDate = new Date().toLocaleString('en-GB')
    return (
      <React.Fragment>
        <AlertDialog
          open={this.state.dialogOpen}
          toggleDialog={this.toggleDialog.bind(this)}
          title="Permission to play 16kHz Audio Message Localiser"
          message="A high-frequency sound (16kHZ) lasting about 1 second will be played for the purpose of acoustically localising your audience. Please ensure audibility to all devices.
              Are you ready?"
          agreeCB={this.agreeCB.bind(this)}
        />
        <Card
          className={classes.card}
          style={
            this.props.bgCol ? { backgroundColor: 'rgba(250,116,116,0.5)' } : {}
          }
        >
          <CardContent>
            <Typography className={classes.title} gutterBottom>
              <span style={{ fontSize: '1.1em', marginRight: '0.4em' }}>
                EVENTCODE --
              </span>
              <span style={{ color: 'dodgerblue', fontSize: '1.5em' }}>
                {this.props.eventCode.substr(0, 6)}
              </span>
            </Typography>
            <Typography variant="h4" component="h4">
              <em>{this.props.eventName}</em>
            </Typography>
            <Typography className={classes.pos}>
              <span style={{ color: 'darkblue' }}>START @</span>{' '}
              {`${this.props.eventStart.toLocaleString().substr(0, 17)}`}
            </Typography>
            <Typography className={classes.pos}>
              <span style={{ color: 'darkblue' }}>END @</span>{' '}
              {`${this.props.eventEnd.toLocaleString().substr(0, 17)}`}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="primary"
              disabled={this.props.bgCol}
              variant="outlined"
              onClick={e => {
                this.setState({
                  dialogOpen: true,
                })
              }}
            >
              Take attendance
            </Button>
            <Button
              size="small"
              style={{ color: 'red' }}
              onClick={() => this.props.deleteEvent(this.props.eventCode)}
            >
              <Delete />
            </Button>
            <Button
              size="small"
              color="primary"
              disabled={this.props.bgCol}
              variant="contained"
              onClick={() =>
                this.props.openModal({
                  eventCode: this.props.eventCode,
                  eventName: this.props.eventName,
                  eventStartDate: this.props.eventStart,
                  eventEndDate: this.props.eventEnd,
                  eventDate: this.props.eventDate,
                  eventMode: this.props.eventMode,
                  eventLocation: this.props.eventLocation,
                })
              }
            >
              Update
            </Button>
            <Button
              size="small"
              color="primary"
              // disabled={this.props.eventStart >= currDate}
              variant="contained"
              onClick={() => {
                Router.push(
                  `/analytics?eventCode=${this.props.eventCode}`,
                  `/stats/${encodeURIComponent(this.props.eventCode)}`
                )
              }}
            >
              Analytics
            </Button>
          </CardActions>
        </Card>
      </React.Fragment>
    )
  }
}

ClassCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(ClassCard)

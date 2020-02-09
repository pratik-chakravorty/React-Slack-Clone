import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from "semantic-ui-react";

class Channels extends React.Component {
  state = {
    activeChannel: "",
    channel: null,
    user: this.props.currentUser,
    channels: [],
    modal: false,
    channelname: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    //needed for channel notifications
    messagesRef: firebase.database().ref("messages"),
    //handle notifications
    notifications: [],
    firstLoad: true
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  addListeners = () => {
    const loadedChannels = [];
    //read values from firebase, using the on listener and getting the value from the snap callback
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      //Once we setState we can run a callback and do stuff.
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId => {
    //listen for any new values added to the channels.
    this.state.messagesRef.child(channelId).on("value", snap => {
      if (this.state.channel) {
        //show notifications on channel that the user is not on
        this.handleNotifications(
          channelId,
          this.state.channel.key,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      notification => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          //difference to get the new messages count
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({ firstLoad: false });
  };

  closeModal = () => this.setState({ modal: false });
  openModal = () => this.setState({ modal: true });

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleSubmit = e => {
    e.preventDefault();
    if (this.isFormValid()) {
      this.addChannel();
    }
  };

  addChannel = () => {
    const { channelname, channelDetails, user, channelsRef } = this.state;

    //generate a random key everytime we create a channel
    const key = channelsRef.push().key;

    //create the new channel object
    const newChannel = {
      name: channelname,
      details: channelDetails,
      key,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelname: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added");
      })
      .catch(err => {
        console.error(err);
      });
  };

  changeChannels = channel => {
    this.setActiveChannel(channel);
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  getNotificationCount = channel => {
    console.log(channel);
    let count = 0;
    this.state.notifications.forEach(notification => {
      if (notification.id === channel.key) {
        count = notification.count;
      }
    });
    if (count > 0) return count;
  };
  clearNotifications = () => {
    console.log("channel log", this.state.channel);
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.key
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.key });
  };
  displayChannels = () => {
    const { channels } = this.state;
    return (
      channels.length > 0 &&
      channels.map(channel => (
        <Menu.Item
          key={channel.key}
          onClick={() => this.changeChannels(channel)}
          name={channel.name}
          active={channel.key === this.state.activeChannel}
          style={{ opacity: 0.7 }}
        >
          {this.getNotificationCount(channel) && (
            <Label color="red">{this.getNotificationCount(channel)}</Label>
          )}
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  isFormValid = () => this.state.channelname && this.state.channelDetails;

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {/* Channels */}
          {this.displayChannels()}
        </Menu.Menu>
        {/* Add Channel Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelname"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);

import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class Starred extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    activeChannel: "",
    starredChannels: []
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = { key: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });

    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const channelToRemove = { key: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(
          channel => channel.key !== channelToRemove.key
        );
        this.setState({
          starredChannels: filteredChannels
        });
      });
  };
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.key });
  };

  changeChannels = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };
  displayChannels = () => {
    const { starredChannels } = this.state;
    return (
      starredChannels.length > 0 &&
      starredChannels.map(channel => (
        <Menu.Item
          key={channel.key}
          onClick={() => this.changeChannels(channel)}
          name={channel.name}
          active={channel.key === this.state.activeChannel}
          style={{ opacity: 0.7 }}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };
  render() {
    const { starredChannels } = this.state;
    console.log("star", starredChannels);
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannels.length})
        </Menu.Item>
        {/* Channels */}
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);

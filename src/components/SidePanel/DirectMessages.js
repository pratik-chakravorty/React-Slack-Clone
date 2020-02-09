import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class DirectMessages extends React.Component {
  state = {
    user: this.props.currentUser,
    //will hold the activeChannel info used for highlighting the current channel
    activeChannel: "",
    //list of users that are not the current logged in user
    users: [],
    usersRef: firebase.database().ref("users"),
    //know whether users are online or offline
    connectedRef: firebase.database().ref(".info/connected"),
    //keep track of currently available users
    presenceRef: firebase.database().ref("presence")
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }
  addListeners = currentUserUid => {
    let loadedUsers = [];
    //get all users except the current logged in  user
    this.state.usersRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        this.setState({
          users: loadedUsers
        });
      }
    });

    //check if there is a value change in connectedRef
    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);
        //firebase monitors this and if the user connection times out or closed it fires this event.
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    this.state.presenceRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        //add status to the user
        this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on("child_removed", snap => {
      if (currentUserUid !== snap.key) {
        //add status to the user
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  // Check if user is online if yes sets status otherwise sets as offline from the users list
  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ user: updatedUsers });
  };

  isUserOnline = user => user.status === "online";

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      key: channelId,
      name: user.name
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  setActiveChannel = uid => {
    this.setState({ activeChannel: uid });
  };

  getChannelId = userId => {
    console.log("userId", userId);
    const currentUserId = this.props.currentUser.uid;
    console.log(currentUserId);
    //make a unique channel identifier
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };
  render() {
    const { users, activeChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {/* Users can send direct messages */}
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              //indicate whether user is online or offline
              color={this.isUserOnline(user) ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, {
  setCurrentChannel,
  setPrivateChannel
})(DirectMessages);

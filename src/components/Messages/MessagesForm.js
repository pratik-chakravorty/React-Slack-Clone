import React, { Component } from "react";
import firebase from "../../firebase";
import uuidv4 from "uuid/v4";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

class MessagesForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadState: "",
    percentUploaded: 0,
    uploadTask: null,
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false
  };

  uploadFile = (file, metadata) => {
    //get the upload path - channel key
    const pathToUpload = this.state.channel.key;
    //passed down from Messages Component
    const ref = this.props.getMessagesRef();
    //where the file will be stored in firebase
    const filePath = `chat/public/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        //get the percentage uploaded
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            //track how much file is uploaded..
            this.setState({ percentUploaded });
          },
          err => {
            //if there are any errors
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            //get the fileURl
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };
  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  createMessage = (fileUrl = null) => {
    const { user } = this.state;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      //send the message
      this.setState({ loading: true });
      console.log("chanel key", channel.key);
      getMessagesRef()
        .child(channel.key)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };
  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded
    } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          onChange={this.handleChange}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon={"add"} />}
          labelPosition="left"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            disabled={loading}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            onClick={this.openModal}
            content="Upload Media"
            disabled={uploadState === "uploading"}
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessagesForm;

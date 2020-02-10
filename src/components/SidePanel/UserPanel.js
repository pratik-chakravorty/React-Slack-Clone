import React from "react";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from "semantic-ui-react";
import AvatarEditor from "react-avatar-editor";
import firebase from "../../firebase";

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    uploadedCroppedImage: "",
    blob: "",
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    metadata: {
      contentType: "image/jpeg"
    }
  };
  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as{" "}
          <strong>{this.state.user && this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignOut}>Sign Out</span>
    }
  ];
  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("signed out");
      });
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      /*Starts reading the contents of the specified file, once finished,
      the result attribute contains a data: URL representing the file's data.*/
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };
  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };
  uploadCroppedImage = () => {
    const { storageRef, userRef, metadata, blob } = this.state;
    storageRef
      .child(`avatar/user-${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () => {
            this.changeAvatar();
          });
        });
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log("avatar changed");
        this.closeModal();
      })
      .catch(err => console.error(err));

    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log("user avatar updated in DB");
      })
      .catch(err => {
        console.error(err);
      });
  };
  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;
    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* App Header */}
            <Header inverted float="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>
          </Grid.Row>
          {/* User Dropdown */}
          <Header style={{ padding: "0.25em" }} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={user && user.photoURL} spaced="right" avatar />
                  {user && user.displayName}
                </span>
              }
              options={this.dropdownOptions()}
            />
          </Header>
        </Grid.Column>
        <Modal open={modal} onClose={this.closeModal}>
          <Modal.Header>Change Avatar</Modal.Header>
          <Modal.Content>
            <Input
              fluid
              onChange={this.handleChange}
              type="file"
              label="New Avatar"
              name="previewImage"
            />
            <Grid centered stackable columns={2}>
              <Grid.Row centered>
                <Grid.Column className="ui center aligned grid">
                  {previewImage && (
                    <AvatarEditor
                      ref={node => (this.avatarEditor = node)}
                      image={previewImage}
                      width={120}
                      height={120}
                      border={50}
                      scale={1.2}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  {croppedImage && (
                    <Image
                      style={{ margin: "3.5em auto" }}
                      width={100}
                      height={100}
                      src={croppedImage}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            {croppedImage && (
              <Button color="green" inverted onClick={this.uploadCroppedImage}>
                <Icon name="save" /> Change Avatar
              </Button>
            )}
            <Button color="green" inverted onClick={this.handleCropImage}>
              <Icon name="image" /> Preview
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid>
    );
  }
}

export default UserPanel;

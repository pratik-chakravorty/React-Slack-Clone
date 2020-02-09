import React from "react";
import md5 from "md5";
import firebase from "../../firebase";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    usersRef: firebase.database().ref("users")
  };
  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty()) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid()) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
    } else {
      return true;
    }
  };

  isFormEmpty = () => {
    const { username, email, password, passwordConfirmation } = this.state;
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = () => {
    const { password, passwordConfirmation } = this.state;
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    }
    return true;
  };

  displayErrors = () =>
    this.state.errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleSubmit = e => {
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      e.preventDefault();
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              //save user in the database
              this.saveUser(createdUser).then(() => {
                console.log("user saved");
              });
            })
            .catch(err => {
              console.error(err);
              this.setState({
                loading: false,
                errors: this.state.errors.concat(err)
              });
            });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    }
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };
  handleInputError = (errors, input) => {
    return errors.some(error => error.message.toLowerCase().includes(input))
      ? "error"
      : "";
  };
  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                type="text"
                value={username}
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                className={this.handleInputError(errors, "email")}
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                value={password}
                className={this.handleInputError(errors, "password")}
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                type="password"
                value={passwordConfirmation}
                className={this.handleInputError(errors, "password")}
                onChange={this.handleChange}
              />
              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>
              <Message>
                Already a user? <Link to="/login">Login</Link>
              </Message>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors()}
            </Message>
          )}
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;

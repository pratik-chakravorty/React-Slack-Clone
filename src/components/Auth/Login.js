import React from "react";
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

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false
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
      //login the user
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(loggedUser => {
          console.log("signed in user", loggedUser);
          this.setState({ loading: false });
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

  isFormValid = () => this.state.email && this.state.password;

  handleInputError = (errors, input) => {
    return errors.some(error => error.message.toLowerCase().includes(input))
      ? "error"
      : "";
  };
  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
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
              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="violet"
                fluid
                size="large"
              >
                Submit
              </Button>
              <Message>
                Don't have an account? <Link to="/register">Registers</Link>
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

export default Login;

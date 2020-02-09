import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
// All Styles are written here..
import "./components/App.css";

import App from "./components/App";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import registerServiceWorker from "./registerServiceWorker";
//firebase configs
import firebase from "./firebase";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";

import { createStore } from "redux";

import { Provider, connect } from "react-redux";
import Spinner from "./components/Spinner";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
import { setUser, clearUser } from "./actions";

//composeWithDevTools gives access to Redux DevTools in the browser
const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {
  componentDidMount() {
    //listener will check if we have a user or not.
    /*
      The onAuthStateChanged listener will keep listening for changes 
      on the auth state(basically if there is a user or not)
    */
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        //If there is a user change the route to the home route.
        this.props.history.push("/");
        //Set the current user in the store.
        this.props.setUser(user);
      } else {
        //clear the user
        this.props.clearUser();
        //Redirect the user back to login (If not Authenticated)
        this.props.history.push("/login");
      }
    });
  }
  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapStateToProps = state => ({
  isLoading: state.user.isLoading
});

// Put the HOC connect inside HOC withRouter.
// TODO -  Could be refactored to not use connect at all.
const RootWithAuth = withRouter(
  connect(mapStateToProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();

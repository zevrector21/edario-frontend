import agent from '../agent';
import Header from './Header';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { APP_LOAD, REDIRECT } from '../constants/actionTypes';
import { Route, Switch } from 'react-router-dom';
import Home from '../components/Home';
import Login from '../components/Login';
import Profile from '../components/Profile';
import Register from '../components/Register';
import Settings from '../components/Settings';
import ConfirmResources from '../components/ConfirmResources';
import AlignResources from '../components/AlignResources';
import { store } from '../store';
import { push } from 'react-router-redux';


function App(props) {

  useEffect(() => {
    if (props.redirectTo) {      
      store.dispatch(push(props.redirectTo));
      props.onRedirect();
    }
  });
  
  useEffect(() => {    
    const token = window.localStorage.getItem('jwt');
    if (token) {
      agent.setToken(token);
    }
    props.onLoad(token ? agent.Auth.current() : null, token);
  }, []);


  return (
    props.appLoaded?
      <>
        {/*<Header
                  appName={props.appName}
                  currentUser={props.currentUser} />*/}
          <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/login" component={Login} />
          <Route path="/confirm-resources" component={ConfirmResources} />
          <Route path="/align-resources" component={AlignResources} />
          <Route path="/register" component={Register} />            
          <Route path="/settings" component={Settings} />
          <Route path="/@:username" component={Profile} />
          </Switch>
      </>
    :  
      <div>
        {/*<Header
                appName={props.appName}
                currentUser={props.currentUser} />*/}
      </div>
  )
}

const mapStateToProps = state => {
  return {
    appLoaded: state.common.appLoaded,
    appName: state.common.appName,
    currentUser: state.common.currentUser,
    redirectTo: state.common.redirectTo
  }};

const mapDispatchToProps = dispatch => ({
  onLoad: (payload, token) =>
    dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
  onRedirect: () =>
    dispatch({ type: REDIRECT })
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

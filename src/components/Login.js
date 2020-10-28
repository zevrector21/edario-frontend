import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React, { useState, useEffect } from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  UPDATE_FIELD_AUTH,
  LOGIN,
  LOGIN_PAGE_UNLOADED
} from '../constants/actionTypes';


function Login(props) {

  const [ auth, setAuth ] = useState({
    email: '',
    password: ''
  });

  function handleChange(event) {
    const { value, name } = event.target;
    setAuth(prevValue => ({...prevValue, [name]: value}));
  }

  function submitForm(event) {
    event.preventDefault();    
    props.onSubmit(auth.email, auth.password);
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 col-xs-12 m-auto">
            <h1 className="text-xs-center">Sign In</h1>
            <p className="text-xs-center">
              <Link to="/register">
                Need an account?
              </Link>
            </p>
            <ListErrors errors={props.errors} />
            <form onSubmit={submitForm}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={auth.email}
                    onChange={handleChange} />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    name="password"                    
                    type="password"
                    placeholder="Password"
                    value={auth.password}
                    onChange={handleChange} />
                </fieldset>
                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                  disabled={props.inProgress}>
                  Sign in
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
};

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
  onSubmit: (email, password) =>
    dispatch({ type: LOGIN, payload: agent.Auth.login(email, password) }),
  onUnload: () =>
    dispatch({ type: LOGIN_PAGE_UNLOADED })
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

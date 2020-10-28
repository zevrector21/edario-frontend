import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React, { useState, useEffect } from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  UPDATE_FIELD_AUTH,
  REGISTER,
  REGISTER_PAGE_UNLOADED
} from '../constants/actionTypes';


function Register(props) {

  const [ auth, setAuth ] = useState({
    username: '',
    email: '',
    password: ''
  });

  function handleChange(event) {
    const { value, name } = event.target;
    setAuth(prevValue => ({...prevValue, [name]: value}));
  }

  function submitForm(event) {
    event.preventDefault();    
    props.onSubmit(auth.username, auth.email, auth.password);
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 col-xs-12 m-auto">
            <h1 className="text-xs-center">Sign Up</h1>
            <p className="text-xs-center">
              <Link to="/login">
                Have an account?
              </Link>
            </p>
            <ListErrors errors={props.errors} />
            <form onSubmit={submitForm}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={auth.username}
                    onChange={handleChange} />
                </fieldset>
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
                  Sign up
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
  onSubmit: (username, email, password) => {
    const payload = agent.Auth.register(username, email, password);
    dispatch({ type: REGISTER, payload })
  },
  onUnload: () =>
    dispatch({ type: REGISTER_PAGE_UNLOADED })
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);

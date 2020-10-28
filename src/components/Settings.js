import ListErrors from './ListErrors';
import React, { useState, useEffect } from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  SETTINGS_SAVED,
  SETTINGS_PAGE_UNLOADED,
  LOGOUT
} from '../constants/actionTypes';

function Settings(props) {
  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 col-xs-12 m-auto">
            <h1 className="text-xs-center mb-4">Your Settings</h1>
            <ListErrors errors={props.errors}></ListErrors>
            <SettingsForm
              currentUser={props.currentUser}
              onSubmitForm={props.onSubmitForm} />
            <hr />
            <button
              className="btn btn-outline-danger"
              onClick={props.onClickLogout}>
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsForm(props) {

  const [ auth, setAuth ] = useState({
    image: '',
    username: '',
    bio: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    setAuth(prevValue => ({...prevValue, 
      image: props.currentUser.image || '',
      username: props.currentUser.username,
      bio: props.currentUser.bio || '',
      email: props.currentUser.email
    }))
  }, []);

  function handleChange(event) {
    const { value, name } = event.target;
    setAuth(prevValue => ({...prevValue, [name]: value}));
  }

  function submitForm(event) {
    event.preventDefault();
    const user = Object.assign({}, auth);
      if (!user.password) {
        delete user.password;
      }
    props.onSubmitForm(user);
  }

  return (
    <form onSubmit={submitForm}>
      <fieldset>
        <fieldset className="form-group">
          <input
            className="form-control"
            name="image"
            type="text"
            placeholder="URL of profile picture"
            value={auth.image}
            onChange={handleChange} />
        </fieldset>
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
          <textarea
            className="form-control form-control-lg"
            name="bio"
            rows="8"
            placeholder="Short bio about you"
            value={auth.bio}
            onChange={handleChange} >
          </textarea>
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
            placeholder="New Password"
            value={auth.password}
            onChange={handleChange} />
        </fieldset>
        <button
          className="btn btn-lg btn-primary pull-xs-right"
          type="submit"
          disabled={props.inProgress}>
          Update Settings
        </button>
      </fieldset>
    </form>
  )
}

const mapStateToProps = state => ({
  ...state.settings,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onClickLogout: () => dispatch({ type: LOGOUT }),
  onSubmitForm: user =>
    dispatch({ type: SETTINGS_SAVED, payload: agent.Auth.save(user) }),
  onUnload: () => dispatch({ type: SETTINGS_PAGE_UNLOADED })
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

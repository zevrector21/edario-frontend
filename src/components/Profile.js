import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  FOLLOW_USER,
  UNFOLLOW_USER,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED
} from '../constants/actionTypes';


function Profile(props) {

  useEffect(() => {
    props.onLoad(Promise.all([
      agent.Profile.get(props.match.params.username)
    ]));
  }, []);

  const profile = props.profile;  

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 m-auto">
              <img src={profile.image} className="user-img" alt={profile.username} />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 m-auto">
            Profile Content
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  currentUser: state.common.currentUser,
  profile: state.profile
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload => dispatch({ type: PROFILE_PAGE_LOADED, payload }),  
  onUnload: () => dispatch({ type: PROFILE_PAGE_UNLOADED })
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

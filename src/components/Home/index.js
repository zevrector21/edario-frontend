import Banner from './Banner';
import React, { useState, useEffect } from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import {
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
} from '../../constants/actionTypes';

const Promise = global.Promise;

function Home(props) {
  return (
    <div className="home-page">
      <Banner token={props.token}/>
      <div className="container page">
        <div className="row">
          <div className="col-md-3">
            <div className="sidebar">
            </div>
          </div>
          <div className="col-md-9">
            <div className="main-content">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  ...state.home,
  appName: state.common.appName,
  token: state.common.token
});

const mapDispatchToProps = dispatch => ({
  onLoad: (tab, pager, payload) =>
    dispatch({ type: HOME_PAGE_LOADED, tab, pager, payload }),
  onUnload: () =>
    dispatch({  type: HOME_PAGE_UNLOADED })
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);

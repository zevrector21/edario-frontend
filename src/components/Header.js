import React from 'react';
import { Link } from 'react-router-dom';

function Header(props) {
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link to="/" className="navbar-brand">
          {props.appName.toLowerCase()}
        </Link>
        {
          props.currentUser?
            <ul className="nav pull-xs-right">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>        
              <li className="nav-item">
                <Link to="/settings" className="nav-link">
                  <i className="ion-gear-a"></i>&nbsp;Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to={`/@${props.currentUser.username}`}
                  className="nav-link">
                  <img src={props.currentUser.image} className="user-pic" alt={props.currentUser.username} />
                </Link>
              </li>
            </ul>
          :
            <ul className="nav pull-xs-right flex">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Sign in
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Sign up
                </Link>
              </li>
            </ul>
        }
      </div>
    </nav>
  )
}

export default Header;

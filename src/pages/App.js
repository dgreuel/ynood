import React from 'react'
import { IndexLink, Link } from 'react-website'
import logo from './ynood_logo.jpg'
import './App.css'

export default ({ children }) => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
    </header>
    <ul className="Navbar">
      <li>
        <IndexLink to="/"> Home </IndexLink>
      </li>
      <li>
        <Link to="/about"> About </Link>
      </li>
    </ul>
    <div className="Body">{children}</div>
  </div>
)

import React from 'react'
import { IndexLink, Link } from 'react-website'
import logo from './ynood_logo.jpg'
import './App.css'

export default ({ children }) => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
    </header>
    <nav class="mb-1 navbar navbar-expand-lg navbar-dark ">
      <a class="navbar-brand">
        {' '}
        <IndexLink to="/"> Home </IndexLink>
      </a>
      <a class="navbar-brand">
        <Link to="/about"> About </Link>
      </a>
    </nav>

    <div className="Body">{children}</div>
  </div>
)

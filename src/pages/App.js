import React from 'react'
import { IndexLink, Link } from 'react-website'
import logo from './ynood_logo.jpg'
import './App.css'

export default ({ children }) => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
    </header>
    <nav className="mb-1 navbar navbar-expand-lg navbar-dark ">
      <ul>
        <li className="navbar-brand">
          <IndexLink to="/"> Home </IndexLink>
        </li>
        <li className="navbar-brand">
          <Link to="/about"> About </Link>
        </li>
      </ul>
    </nav>

    <div className="Body">{children}</div>
    <div className="Footer">&copy; 2018 YNOOD; You Need Out of Debt is not affiliated in any way with You Need A Budget (YNAB).</div>
  </div>
)

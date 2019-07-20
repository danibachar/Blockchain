import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import MainView from './components/MainView';

const App = () => (
	<Router>
		<Switch>
			<Route exact path="/" component={MainView} />
		</Switch>
	</Router>
);


export default App;

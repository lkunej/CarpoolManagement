import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { CreateOrUpdateRideshare } from './components/CreateOrUpdateRideshare';
import { Overview } from './components/Overview';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
            <Route exact path='/' component={Home} />
            <Route path='/create' component={CreateOrUpdateRideshare} />
            <Route path='/edit/:id' component={CreateOrUpdateRideshare} />
            <Route path='/overview' component={Overview} />
      </Layout>
    );
  }
}

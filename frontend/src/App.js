import './App.css';
import { Route, Switch } from 'react-router-dom';

import { Index } from './pages/Index/Index';
import { Detailed } from './pages/Detailed/Detailed';
import { Login } from './pages/Login/Login';
import { NotFound } from './pages/Notfound/NotFound';


function App() {
  return (
    //possible layout
    // /:id is a second route that needs its own switch or similar
    <Switch>
      <Route exact path="/" component={Index}/>
      <Route exact path="/admin" component={Login}/>
      <Route exact path="/:id" component={Detailed}/>
      <Route component={NotFound}/>
    </Switch>
  );
}

export default App;

import './App.css';
import { Route, Switch } from 'react-router-dom';

import { Index } from './pages/Index/Index';
import { Detailed } from './pages/Detailed/Detailed';
import { Login } from './pages/Login/Login';
import { NotFound } from './pages/Notfound/NotFound';
import { Building } from './pages/Building/Building';
import { About } from './pages/About/About';
import { RawData } from './pages/RawData/RawData';

function App() {
  return (
    //possible layout
    // /finds/:id is a second route that needs its own switch or similar
    <Switch>
      <Route exact path="/" component={Index}/>
      <Route exact path="/admin" component={Login}/>
      <Route exact path="/about" component={About}/>
      <Route exact path="/raw" component={RawData}/>
      <Route exact path="/login" component={Login}/>
      <Route exact path="/finds/:id" component={Detailed}/>
      <Route path="/building/:idNyear" component={Building}/>
      <Route component={NotFound}/>
    </Switch>
  );
}

export default App;

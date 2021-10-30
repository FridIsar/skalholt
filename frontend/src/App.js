import './App.css';
import { Route, Switch } from 'react-router-dom';

import { Index } from './pages/Index/Index';
import { Login } from './pages/Login/Login';
import { NotFound } from './pages/Notfound/NotFound';
import { Building } from './pages/Building/Building';
import { RawData } from './pages/RawData/RawData';
import { InteractiveMap } from './pages/InteractiveMap/InteractiveMap';

function App() {
  return (
    <Switch>
      <Route exact path="/" component={Index}/>
      <Route exact path="/interactive" component={InteractiveMap}/>
      <Route exact path="/raw" component={RawData}/>
      <Route exact path="/login" component={Login}/>
      <Route path="/building/:idNyear" component={Building}/>
      <Route component={NotFound}/>
    </Switch>
  );
}

export default App;

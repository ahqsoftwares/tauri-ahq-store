import logo from './index.png';
import './App.css';

function App(props: { info: string}) {

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Loading" />
        <p>
          {props.info}
        </p>
      </header>
    </div>
  );
}

export default App;

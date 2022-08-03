import logo from './index.png';

function App(props: { info: string}) {

  return (
    <header className="login-background">
      <div className="modal">
        <div className="mt-10"></div>
        <h1>AHQ Store</h1>
        <div className='mt-[5rem]'></div>
        <img src={logo} alt={"logo"} width={"200px"} />
        <div className='mt-auto'></div>
        <h2><strong>{props.info}</strong></h2>
        <div className='mb-auto'></div>
      </div>
    </header>
  );
}

export default App;

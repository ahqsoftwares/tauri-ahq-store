import "../../css/home/main.css";

export default function Home() {
  return <div className="home-cnt">
    <div className="home-intro">
      <div>
        <h2>Introducing</h2>
        <h1>AHQ Store</h1>
        <h3>The <strong>ONLY</strong> open sourced App Store</h3>
        <h4>
          <strong>Imagine an app store!</strong>
          <br />
          <span>The store manages your apps, updated them and lets you focus on the main development stuff. <strong>FOR FREE??</strong></span>
          <br />
          <span>Just download the AHQ Store to enjoy the same benefits!</span>
        </h4>

        <button>Download Setup</button>
        <button>Download MSI</button>
      </div>
      <div>
        <img src="/logo512.webp" />
      </div>
    </div>
  </div>;
}

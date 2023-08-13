import pages from "../../router/pages.json";

function toRoot() {
  window.location.pathname = "/home";
}

export default function Navigation() {
  return (
    <div className="nav">
      <img
        src="/logo192.webp"
        alt="Icon"
        className="nav-item"
        onClick={() => toRoot()}
      />
      <img
        src="/logo192.webp"
        alt="Icon"
        className="nav-item-m"
        onClick={() => toRoot()}
      />
      <div className="nav-item">
        <button onClick={() => toRoot()}>AHQ Store</button>
      </div>
      <div className="ml-auto nav-item">
        {pages.map((page, i) => (
          <button
            key={`${page}${i}`}
            onClick={() => (window.location.pathname = page)}
            className={window.location.pathname == page ? "nav-active" : ""}
          >
            {(() => {
              const [a, ...b] = page.split("/")[1];

              return a.toUpperCase() + b.join("").toLowerCase();
            })()}
          </button>
        ))}
      </div>
    </div>
  );
}

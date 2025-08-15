import BlockFieldRulesPanel from "./BlockFieldRulesPanel.tsx";

const BlockPanel = () => {

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light border-bottom border-1 border-primary">
        <div className="container-fluid text-primary">
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a className="dropdown-item" href="#">Details</a>
                <a className="dropdown-item" href="#">Field Rules</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <BlockFieldRulesPanel></BlockFieldRulesPanel>
    </>
  )
}

export default BlockPanel;

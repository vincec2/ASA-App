import { navItems } from "../constants/navItems";
import type { Page } from "../types/domain";

type AppHeaderProps = {
  activePage: Page;
  onPageChange: (page: Page) => void;
};

function AppHeader({ activePage, onPageChange }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1>ASA App</h1>
        <p>Artificial Secretary Assistant</p>
      </div>

      <nav className="top-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => onPageChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default AppHeader;
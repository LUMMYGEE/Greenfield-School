import { NavLink } from "react-router-dom";

const Sidebar = ({ onMenuItemClick }) => {
  const navItems = [
    { path: "/dashboard", label: "Overview" },
    { path: "/dashboard/students", label: "Students" },
    { path: "/dashboard/teachers", label: "Teachers" },
    { path: "/dashboard/classes", label: "Classes" },
    { path: "/dashboard/subjects", label: "Subjects" },
    { path: "/dashboard/reports", label: "Reports" },
    { path: "/dashboard/carousel", label: "Carousel Management" },
    { path: "/dashboard/admin-review", label: "Admin Review" },
    { path: "/dashboard/admins", label: "Admins" },
    { path: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="h-full">
      {onMenuItemClick && (
        <button
          className="mb-4 text-white bg-red-500 px-3 py-1 rounded"
          onClick={onMenuItemClick}
        >
          Close Menu
        </button>
      )}
      <h2 className="mt-4 h-6 text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMenuItemClick}
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${
                isActive ? "bg-gray-700 font-medium" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
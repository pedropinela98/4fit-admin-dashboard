import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  ListIcon,
  UserCircleIcon,
  HorizontaLDots,
} from "../icons";
import { CreditCardIcon, TagIcon } from "@heroicons/react/24/outline";
import logo from "../icons/logo.svg";
import logoDark from "../icons/logo-dark.svg";
import logoIcon from "../icons/logo-icon.svg";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../context/UserContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
  superAdminOnly?: boolean;
};

const AppSidebar: React.FC = () => {
  const { boxId, isSuperAdmin } = useUser();
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    closeMobileSidebar,
  } = useSidebar();

  const location = useLocation();
  // depois
  const [openSubmenus, setOpenSubmenus] = useState<number[]>([]);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Nav items dinâmicos
  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: boxId ? `/box/${boxId}` : "#",
    },
    {
      icon: <BoxCubeIcon />,
      name: "Detalhes da Box",
      path: boxId ? `/box/${boxId}/box-details` : "#",
    },
    {
      icon: <GroupIcon />,
      name: "Membros",
      path: boxId ? `/box/${boxId}/members` : "#",
    },
    {
      icon: <BoxCubeIcon />,
      name: "Boxes",
      superAdminOnly: true,
      subItems: [
        { name: "All Boxes", path: "/boxes" },
        { name: "Add Box", path: "/boxes/new" },
      ],
    },
    {
      icon: <GridIcon />,
      name: "Salas",
      path: boxId ? `/box/${boxId}/rooms` : "#",
    },
    {
      icon: <CalenderIcon />,
      name: "Aulas",
      subItems: [
        { name: "Tipos de aulas", path: "/classes/types" },
        { name: "Horário", path: "/classes" },
      ],
    },
    {
      icon: <ListIcon />,
      name: "Treinos",
      subItems: [
        { name: "Planeamento Diário", path: "/workouts" },
        { name: "Planeamento Semanal", path: "/workouts/weeklyview" },
      ],
    },
    {
      icon: <TagIcon />,
      name: "Planos",
      subItems: [
        { name: "Planos Mensais", path: boxId ? `/box/${boxId}/plans` : "#" },
        {
          name: "Planos de Senhas",
          path: boxId ? `/box/${boxId}/sessionpacks` : "#",
        },
        { name: "Seguros", path: boxId ? `/box/${boxId}/insurances` : "#" },
      ],
    },
    {
      icon: <UserCircleIcon />,
      name: "Staff",
      path: boxId ? `/box/${boxId}/staff` : "#",
    },
    { icon: <CreditCardIcon />, name: "Pagamentos", path: "/payments" },
  ];

  // 🧭 Ativar submenu correto ao carregar a página
  useEffect(() => {
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenus((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      }
    });
  }, [location, isActive, navItems]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items
        .filter((item) => !item.superAdminOnly || isSuperAdmin)
        .map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`menu-item group ${
                    openSubmenus.includes(index)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      openSubmenus.includes(index)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenus.includes(index)
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSubmenus.includes(index) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          onClick={closeMobileSidebar}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  onClick={closeMobileSidebar}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 pb-[200px] md:pb-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src={logo} alt="Logo" width={150} />
              <img
                className="hidden dark:block"
                src={logoDark}
                alt="Logo"
                width={150}
              />
            </>
          ) : (
            <img src={logoIcon} alt="Logo" width={150} />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <HorizontaLDots className="size-6" />
            )}
          </h2>
          {renderMenuItems(navItems)}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

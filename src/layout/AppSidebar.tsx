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
import { supabase } from "../lib/supabase"; // 👈 usa o cliente global

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
  superAdminOnly?: boolean; // 👈 flag opcional
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Detalhes da Box",
    path: "/box-details",
  },
  {
    icon: <GroupIcon />,
    name: "Membros",
    path: "/members",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Boxes",
    superAdminOnly: true, // 👈 só super admin
    subItems: [
      { name: "All Boxes", path: "/boxes" },
      { name: "Add Box", path: "/boxes/new" },
    ],
  },
  { icon: <GridIcon />, name: "Salas", path: "/rooms" },
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
      { name: "Planos Mensais", path: "/plans" },
      { name: "Planos de Senhas", path: "/plans/sessionpacks" },
    ],
  },
  { icon: <UserCircleIcon />, name: "Staff", path: "/staff" },
  { icon: <CreditCardIcon />, name: "Pagamentos", path: "/payments" },
];

const CACHE_KEY = "superadmin-status";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    closeMobileSidebar,
  } = useSidebar();

  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Buscar papel do utilizador autenticado (com cache)
  useEffect(() => {
    const checkSuperAdmin = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          setIsSuperAdmin(value);
          return;
        }
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("Box_Staff")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const isSuper = !error && data?.role === "super_admin";
      setIsSuperAdmin(isSuper);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ value: isSuper, timestamp: Date.now() })
      );
    };

    checkSuperAdmin();
  }, []);

  // 🧭 Ativar submenu correto
  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items
        .filter((item) => !item.superAdminOnly || isSuperAdmin)
        .map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`menu-item group ${
                  openSubmenu === index
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
                    openSubmenu === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
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
                      openSubmenu === index ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
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

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`main-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu === index
                      ? `${subMenuHeight[`main-${index}`]}px`
                      : "0px",
                }}
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
      {/* 🔹 Logo */}
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

      {/* 🔹 Menu */}
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

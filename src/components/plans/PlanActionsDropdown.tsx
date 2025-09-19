import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { createPortal } from "react-dom";
import { MoreDotIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { Plan } from "../../hooks/usePlans";

export default function PlanActionsDropdown({ plan }: { plan: Plan }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // calcular posição
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 192 + window.scrollX, // w-48 = 192px
      });
    }
  }, [isOpen]);

  // fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !(event.target as Element).closest("[data-dropdown-container]")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        data-dropdown-container
      >
        <MoreDotIcon className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* fundo */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-50"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <div className="py-1">
                <Link
                  to={`/plans/${plan.id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <PencilIcon className="h-4 w-4 mr-3" />
                  Editar
                </Link>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsOpen(false);
                    if (
                      confirm(
                        `Tens a certeza que queres remover o plano "${plan.name}"?`
                      )
                    ) {
                      console.log("Eliminar plano:", plan.id);
                    }
                  }}
                >
                  <TrashBinIcon className="h-4 w-4 mr-3" />
                  Remover
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

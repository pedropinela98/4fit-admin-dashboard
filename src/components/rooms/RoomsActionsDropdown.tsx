import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { createPortal } from "react-dom";
import { MoreDotIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { Room } from "../../hooks/useRooms";
import { Modal } from "../ui/modal/index";

interface RoomsActionsDropdownProps {
  room: Room;
  onDelete: (roomId: string) => void | Promise<void>;
}

export default function RoomsActionsDropdown({ room, onDelete }: RoomsActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // calcular posição do dropdown
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

  // Fechar dropdown quando o modal abre
  useEffect(() => {
    if (showDeleteModal) {
      setIsOpen(false);
    }
  }, [showDeleteModal]);

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
            {/* fundo para fechar ao clicar fora */}
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
                  to={`/box/${room.box_id}/rooms/${room.id}/editRoom`}
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
                    setShowDeleteModal(true);
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

      {/* MODAL de confirmação */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="max-w-md p-6 text-left"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Remover sala
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Tens a certeza que pretendes remover a sala{" "}
          <span className="font-semibold">"{room.name}"</span>? Esta ação não
          pode ser desfeita.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-lg border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              onDelete(room.id);
              setShowDeleteModal(false);
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Remover
          </button>
        </div>
      </Modal>
    </>
  );
}

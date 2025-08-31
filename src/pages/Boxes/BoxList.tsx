import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { createPortal } from 'react-dom';
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon, GridIcon, MoreDotIcon, GroupIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useBoxes, type Box } from "../../hooks/useBoxes";

// Box Actions Dropdown Component
function BoxActionsDropdown({ box }: { box: Box }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 192 + window.scrollX, // 192px is w-48 (12rem)
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('[data-dropdown-container]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <div className="py-1">
              <Link
                to={`/members?boxId=${box.id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <GroupIcon className="h-4 w-4 mr-3" />
                View Members
              </Link>
              <Link
                to={`/boxes/${box.id}/edit`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <PencilIcon className="h-4 w-4 mr-3" />
                Edit Box
              </Link>
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setIsOpen(false);
                  if (confirm('Are you sure you want to delete this box?')) {
                    // Handle delete - would call deleteBox function
                    console.log('Delete box:', box.id);
                  }
                }}
              >
                <TrashBinIcon className="h-4 w-4 mr-3" />
                Delete Box
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function BoxList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { boxes, loading, error, searchBoxes, refetch } = useBoxes();

  // Handle search with debouncing
  useEffect(() => {
    // Only trigger search when there's an actual search query
    if (!searchQuery.trim()) return;
    
    const timeoutId = setTimeout(() => {
      searchBoxes(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchBoxes]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">Error loading boxes</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Boxes | CrossFit Box Management"
        description="Manage your CrossFit boxes and locations"
      />
      
      <div className="space-y-6">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Boxes
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your CrossFit boxes and locations
            </p>
          </div>
          
          <Link to="/boxes/new">
            <Button className="w-full sm:w-auto">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Box
            </Button>
          </Link>
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <GridIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search boxes by name or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Boxes List - Mobile Cards / Desktop Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading boxes...</p>
            </div>
          ) : (
            <div>
              {/* Mobile View - Card Layout */}
              <div className="sm:hidden">
                {boxes.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No boxes found matching your search' : 'No boxes found'}
                    </p>
                    {!searchQuery && (
                      <Link to="/boxes/new">
                        <Button className="mt-4">Add First Box</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {boxes.map((box) => (
                      <div key={box.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/boxes/${box.id}`}
                              className="block hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded"
                            >
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {box.name}
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                {box.location}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {box.timezone} • {box.currency}
                              </p>
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              box.active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {box.active ? 'Active' : 'Inactive'}
                            </span>
                            <BoxActionsDropdown box={box} />
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(box.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Box Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Timezone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Currency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {boxes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'No boxes found matching your search' : 'No boxes found'}
                          </td>
                        </tr>
                      ) : (
                        boxes.map((box) => (
                          <tr key={box.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <Link 
                                to={`/boxes/${box.id}`}
                                className="block hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {box.name}
                                </div>
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {box.location}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {box.timezone}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {box.currency}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                box.active 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {box.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(box.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <BoxActionsDropdown box={box} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats - Mobile Friendly */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {boxes.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Boxes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {boxes.filter(box => box.active).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Boxes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {boxes.filter(box => !box.active).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Inactive Boxes</div>
          </div>
        </div>
      </div>
    </>
  );
}
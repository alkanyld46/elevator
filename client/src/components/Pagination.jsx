import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/**
 * Reusable Pagination component with dynamic items per page
 * 
 * @param {number} currentPage - Current page number (1-based)
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Number of items per page
 * @param {function} onPageChange - Callback when page changes
 * @param {function} onItemsPerPageChange - Callback when items per page changes
 * @param {number[]} itemsPerPageOptions - Options for items per page dropdown
 * @param {boolean} showItemsPerPage - Whether to show items per page selector
 */
export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 15, 25],
  showItemsPerPage = true
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Don't render if no items
  if (totalItems === 0) return null

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 py-3 px-3 border-top bg-white">
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Show</span>
          <Form.Select
            size="sm"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{ width: 'auto' }}
            className="form-control-modern"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Form.Select>
          <span className="text-muted small">per page</span>
        </div>
      )}

      {/* Page info */}
      <div className="text-muted small">
        Showing {startItem}-{endItem} of {totalItems}
      </div>

      {/* Page navigation */}
      <div className="d-flex align-items-center gap-2">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <FiChevronLeft className="me-1" />
          Previous
        </Button>
        
        <span className="text-muted small px-2">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <FiChevronRight className="ms-1" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Hook to manage pagination state
 * @param {number} initialItemsPerPage - Initial items per page
 * @returns {object} Pagination state and handlers
 */
export function usePagination(initialItemsPerPage = 5) {
  const [page, setPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage)

  const handlePageChange = React.useCallback((newPage) => {
    setPage(newPage)
  }, [])

  const handleItemsPerPageChange = React.useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setPage(1) // Reset to first page when changing items per page
  }, [])

  const resetPage = React.useCallback(() => {
    setPage(1)
  }, [])

  const paginate = React.useCallback((items) => {
    const start = (page - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }, [page, itemsPerPage])

  return {
    page,
    itemsPerPage,
    setPage: handlePageChange,
    setItemsPerPage: handleItemsPerPageChange,
    resetPage,
    paginate
  }
}

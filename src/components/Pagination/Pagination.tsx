import { ReactElement } from 'react';
import { DEFAULT_PAGE_SIZE } from '../../types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './Pagination.css';

interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
    pageSize?: number;
}

export default function Pagination({
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
    onPageChange,
    pageSize = DEFAULT_PAGE_SIZE,
}: PaginationProps): ReactElement {
    const startItem = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endItem = Math.min(pageNumber * pageSize, totalCount);

    return (
        <div className="pagination">
            <div className="pagination-info">
                <span className="pagination-count">
                    Showing {startItem}-{endItem} of {totalCount}
                </span>
            </div>
            
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    disabled={!hasPreviousPage}
                    onClick={() => onPageChange(pageNumber - 1)}
                    title="Previous page"
                >
                    <MaterialIcon icon="chevron_left" size="S" />
                </button>
                
                <span className="pagination-page-info">
                    Page <strong>{pageNumber}</strong> of <strong>{totalPages}</strong>
                </span>
                
                <button
                    className="pagination-btn"
                    disabled={!hasNextPage}
                    onClick={() => onPageChange(pageNumber + 1)}
                    title="Next page"
                >
                    <MaterialIcon icon="chevron_right" size="S" />
                </button>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaFilter, FaChevronDown } from 'react-icons/fa';
import agencies from '../constants/agencies';

export default function FilterBar({ onFilter }) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState('newest');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  const filteredAgencies = useMemo(() => 
    agencies
      .filter(a => 
        // Match by name
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        // Match by ID (acronym)
        a.id.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
  [search]);

  const applyFilters = useCallback(() => {
    onFilter({
      status: status !== 'all' ? status : null,
      category: category !== 'all' ? category : null,
      sort,
    });
    setOpen(false);
  }, [status, category, sort, onFilter]);

  const resetFilters = useCallback(() => {
    setStatus('all');
    setCategory('all');
    setSort('newest');
    onFilter(null);
    setOpen(false);
  }, [onFilter]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center px-3 py-2 rounded border ${
          status !== 'all' || category !== 'all' ? 'border-accent-500 bg-accent-100' : 'border-gray-500'
        }`}
        aria-label="Toggle filter menu"
      >
        <FaFilter className={`${status !== 'all' || category !== 'all' ? 'text-accent-500' : 'text-accent-700'} mr-2`} />
        Filter
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-white border rounded shadow-lg p-4 z-10">
          {/* Sort */}
          <fieldset className="mb-4">
            <legend className="font-medium">Sort By</legend>
            {['newest','oldest','nearest','random'].map(val => (
              <label key={val} className="block">
                <input type="radio" checked={sort === val} onChange={() => setSort(val)} className="mr-2" />
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </label>
            ))}
          </fieldset>

          {/* Agency */}
          <fieldset className="mb-4">
            <legend className="font-medium">Agency</legend>
            <button onClick={() => setDropdownOpen(prev => !prev)} className="w-full flex justify-between px-3 py-2 border rounded">
              {category === 'all' ? 'All Agencies' : agencies.find(a => a.id === category)?.name}
              <FaChevronDown className={dropdownOpen ? 'transform rotate-180' : ''} />
            </button>
            {dropdownOpen && (
              <>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search agencies…"
                  className="w-full px-2 py-1 mt-2 border rounded"
                  aria-label="Search agencies"
                />
                <ul className="max-h-48 overflow-auto mt-2">
                  <li onClick={() => setCategory('all')} className="p-2 hover:bg-gray-100 cursor-pointer">All Agencies</li>
                  {filteredAgencies.map(a => (
                    <li
                      key={a.id}
                      onClick={() => { setCategory(a.id); setDropdownOpen(false); }}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {a.icon}<span>{a.name}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </fieldset>

          {/* Status */}
          <fieldset className="mb-4">
            <legend className="font-medium">Status</legend>
            {['all','Pending','In Progress','Done'].map(s => (
              <label key={s} className="block">
                <input type="radio" checked={status === s} onChange={() => setStatus(s)} className="mr-2" />
                {s}
              </label>
            ))}
          </fieldset>

          <div className="flex justify-between">
            <button onClick={resetFilters} className="text-gray-600">Reset All</button>
            <button onClick={applyFilters} className="bg-primary-500 text-white px-4 py-1 rounded">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

FilterBar.propTypes = {
  onFilter: PropTypes.func.isRequired,
};

"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  cloneElement,
} from "react";
import PropTypes from "prop-types";
import { FaFilter } from "react-icons/fa";
import { Check, ChevronsUpDown, ArrowUpDown } from "lucide-react";
import agencies from "../constants/agencies";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "nearest", label: "Nearest" },
  { value: "upvotes", label: "Upvotes" },
];

export default function FilterBar({ onFilter }) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [agencyOpen, setAgencyOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const menuRef = useRef(null);
  const sortRef = useRef(null);

  const groupedAgencies = useMemo(() => {
    const sortedAgencies = [...agencies].sort(
      (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)
    );

    const groups = [];
    sortedAgencies.forEach((agency) => {
      let groupEntry = groups.find((g) => g.group === agency.group);
      if (!groupEntry) {
        groupEntry = { group: agency.group, items: [] };
        groups.push(groupEntry);
      }
      groupEntry.items.push(agency);
    });

    return groups;
  }, []);

  const selectedAgency = useMemo(
    () => agencies.find((a) => a.id === category),
    [category]
  );
  const sortIsActive = sort !== "newest";

  const emitFilters = useCallback(
    (overrides = {}) => {
      const nextStatus = overrides.status ?? status;
      const nextCategory = overrides.category ?? category;
      const nextSort = overrides.sort ?? sort;

      onFilter({
        status: nextStatus !== "all" ? nextStatus : null,
        category: nextCategory !== "all" ? nextCategory : null,
        sort: nextSort,
      });
    },
    [status, category, sort, onFilter]
  );

  const applyFilters = useCallback(() => {
    emitFilters();
    setOpen(false);
    setAgencyOpen(false);
    setSortOpen(false);
  }, [emitFilters]);

  const resetFilters = useCallback(() => {
    setStatus("all");
    setCategory("all");
    setSort("newest");
    setOpen(false);
    setAgencyOpen(false);
    setSortOpen(false);
    onFilter(null);
  }, [onFilter]);

  const handleSortSelect = useCallback(
    (value) => {
      setSort(value);
      emitFilters({ sort: value });
      setSortOpen(false);
    },
    [emitFilters]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setAgencyOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div ref={menuRef} className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen((prev) => !prev);
            setSortOpen(false);
          }}
          className={cn(
            "flex items-center gap-2 border px-3 py-2 text-sm caret-transparent cursor-pointer",
            status !== "all" || category !== "all"
              ? "border-accent-500 bg-accent-100 text-accent-600 hover:bg-accent-100"
              : "border-gray-500 text-gray-700 hover:bg-gray-100"
          )}
          aria-label="Toggle filter menu"
        >
          <FaFilter />
          Filter
        </Button>

        {open && (
          <div className="absolute left-0 z-10 mt-2 w-120 rounded border bg-white p-4 shadow-lg">
            <fieldset className="mb-4">
              <legend className="font-medium">Agency</legend>
              <Popover open={agencyOpen} onOpenChange={setAgencyOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded border px-3 py-2 text-left"
                    aria-label="Select agency"
                  >
                    <span className="truncate">
                      {category === "all"
                        ? "All Agencies"
                        : selectedAgency?.name || "Select agency"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-110 p-0 truncate" align="start">
                  <Command>
                    <CommandInput className="m-1 !focus:ring-0 !focus:border-none focus:shadow-none" placeholder="Search agencies..." />
                    <CommandEmpty>No agency found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup heading="General">
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setCategory("all");
                            setAgencyOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              category === "all"
                                ? "opacity-100 text-accent-500"
                                : "opacity-0"
                            )}
                          />
                          All Agencies
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                      {groupedAgencies.map(({ group, items }) => (
                        <CommandGroup key={group} heading={group}>
                          {items.map((agency) => (
                            <CommandItem
                              key={agency.id}
                              value={`${agency.name} ${agency.id}`}
                              onSelect={() => {
                                setCategory(agency.id);
                                setAgencyOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category === agency.id
                                    ? "opacity-100 text-accent-500"
                                    : "opacity-0"
                                )}
                              />
                              <span className="flex items-center gap-2">
                                {agency.icon
                                  ? cloneElement(agency.icon, {
                                      className: "h-4 w-4 shrink-0",
                                    })
                                  : null}
                                <span className="text-ellipsis w-64">{agency.name}</span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </fieldset>

            <fieldset className="mb-4">
              <legend className="font-medium">Status</legend>
              {["All", "Pending", "In Progress", "Done"].map((value) => (
                <label key={value} className="block">
                  <input
                    type="radio"
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="mr-2"
                  />
                  {value}
                </label>
              ))}
            </fieldset>

            <div className="flex justify-between">
              <button onClick={resetFilters} className="text-gray-600">
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="rounded bg-primary-500 px-4 py-1 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div ref={sortRef} className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSortOpen((prev) => !prev);
            setOpen(false);
            setAgencyOpen(false);
          }}
          className={cn(
            "flex items-center gap-2 border px-3 py-2 text-sm caret-transparent cursor-pointer",
            sortIsActive
              ? "border-accent-500 bg-accent-100 text-accent-600 hover:bg-accent-100"
              : "border-gray-500 text-gray-700 hover:bg-gray-100"
          )}
          aria-label="Toggle sort menu"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>

        {sortOpen && (
          <div className="absolute left-0 z-10 mt-2 w-56 rounded border bg-white p-3 shadow-lg">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">
                Sort By
              </legend>
              <div className="space-y-1">
                {SORT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center rounded px-2 py-1 text-sm hover:bg-gray-100"
                  >
                    <input
                      type="radio"
                      checked={sort === option.value}
                      onChange={() => handleSortSelect(option.value)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  onFilter: PropTypes.func.isRequired,
};


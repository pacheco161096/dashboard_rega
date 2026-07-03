"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  customersService,
  CustomerListItem,
  filterCustomersByIdentitySearch,
} from "@/lib/services/customersService";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 200;
const MIN_SEARCH_LENGTH = 1;
const MAX_RESULTS = 12;

export interface ClientSearchSelectProps {
  value: string;
  onChange: (clientId: string, client?: CustomerListItem | null) => void;
  onResolvedLabel?: (label: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
}

function formatClientLabel(client: CustomerListItem): string {
  const fullName = [client.nombre, client.apellido].filter(Boolean).join(" ").trim();
  const name = fullName || client.email || "Sin nombre";
  return `${name} · ID: ${client.id}`;
}

export default function ClientSearchSelect({
  value,
  onChange,
  onResolvedLabel,
  disabled = false,
  error,
  className,
  placeholder = "Buscar por nombre o ID...",
}: ClientSearchSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const clientsCacheRef = useRef<CustomerListItem[] | null>(null);
  const onResolvedLabelRef = useRef(onResolvedLabel);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    onResolvedLabelRef.current = onResolvedLabel;
  }, [onResolvedLabel]);

  const applyLabel = (label: string) => {
    setSelectedLabel(label);
    onResolvedLabelRef.current?.(label);
  };

  useEffect(() => {
    let cancelled = false;

    const resolveSelectedClient = async () => {
      if (!value) {
        setSelectedLabel("");
        return;
      }

      setIsLoadingSelected(true);
      try {
        const clients = await customersService.fetchCustomersByIds([value]);
        if (cancelled) return;

        const client = clients[0];
        const label = client ? formatClientLabel(client) : `ID: ${value}`;
        setSelectedLabel(label);
        onResolvedLabelRef.current?.(label);
      } catch {
        if (cancelled) return;
        const label = `ID: ${value}`;
        setSelectedLabel(label);
        onResolvedLabelRef.current?.(label);
      } finally {
        if (!cancelled) {
          setIsLoadingSelected(false);
        }
      }
    };

    void resolveSelectedClient();

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (value || !query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const term = query.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        let clients = clientsCacheRef.current;
        if (!clients) {
          const result = await customersService.fetchCustomersList({
            statusFilter: "todos",
          });
          clients = result.data;
          clientsCacheRef.current = clients;
        }

        if (cancelled) return;

        setResults(filterCustomersByIdentitySearch(clients, term, MAX_RESULTS));
        setIsOpen(true);
      } catch {
        if (cancelled) return;
        setResults([]);
        setSearchError("No se pudo buscar clientes. Intente de nuevo.");
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (client: CustomerListItem) => {
    onChange(String(client.id), client);
    applyLabel(formatClientLabel(client));
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSearchError(null);
  };

  const handleClear = () => {
    onChange("", null);
    applyLabel("");
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSearchError(null);
  };

  const showDropdown =
    isOpen &&
    !value &&
    (isSearching || results.length > 0 || Boolean(searchError) || query.trim().length > 0);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {value ? (
        <div
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border bg-white px-3 text-sm",
            error ? "border-red-500" : "border-input",
            disabled && "opacity-50"
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="min-w-0 flex-1 truncate text-gray-900">
            {isLoadingSelected ? "Cargando cliente..." : selectedLabel}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Quitar cliente seleccionado"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("h-9 pl-9 pr-9", error && "border-red-500 focus-visible:ring-red-500")}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
      )}

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {isSearching && (
            <li className="px-3 py-2 text-sm text-gray-500">Buscando clientes...</li>
          )}

          {!isSearching && searchError && (
            <li className="px-3 py-2 text-sm text-red-600">{searchError}</li>
          )}

          {!isSearching && !searchError && results.length === 0 && query.trim() && (
            <li className="px-3 py-2 text-sm text-gray-500">
              No se encontraron clientes para &quot;{query.trim()}&quot;
            </li>
          )}

          {!isSearching &&
            results.map((client) => (
              <li key={client.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  onClick={() => handleSelect(client)}
                >
                  <span className="font-medium text-gray-900">
                    {[client.nombre, client.apellido].filter(Boolean).join(" ") || "Sin nombre"}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {client.id}
                    {client.email ? ` · ${client.email}` : ""}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

import React from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Search, Filter, Calendar } from "lucide-react";

interface FiltrosPagosProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterEstado: "todos" | "completado" | "pendiente";
  setFilterEstado: (estado: "todos" | "completado" | "pendiente") => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export const FiltrosPagos: React.FC<FiltrosPagosProps> = ({
  searchQuery,
  setSearchQuery,
  filterEstado,
  setFilterEstado,
  showFilters,
  setShowFilters,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-2">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="md:flex-1">
          <Input
            placeholder="Buscar por nombre de anexado o familiar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterEstado === "todos" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterEstado("todos")}
          >
            Todos
          </Button>
          <Button
            variant={filterEstado === "completado" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterEstado("completado")}
          >
            Completados
          </Button>
          <Button
            variant={filterEstado === "pendiente" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterEstado("pendiente")}
          >
            Pendientes
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Fecha inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              leftIcon={<Calendar size={18} />}
            />
          </div>
          <div>
            <Input
              label="Fecha fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              leftIcon={<Calendar size={18} />}
            />
          </div>
        </div>
      )}
    </div>
  );
};

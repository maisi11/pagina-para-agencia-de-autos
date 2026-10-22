import { apiClient } from "../api/client";

export const CatalogosService = {
    async obtenerTodos(){
        return await apiClient('/catalogos')
    }
}
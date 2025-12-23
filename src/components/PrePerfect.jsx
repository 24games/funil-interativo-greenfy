import { useEffect } from 'react'

export default function PrePerfect() {
  useEffect(() => {
    // Preserva TODOS os parâmetros de consulta (query params) da URL atual
    const queryString = window.location.search
    
    // Monta a URL de destino preservando todos os parâmetros
    const destinationUrl = `/perfect${queryString}`
    
    // Redireciona imediatamente usando replace para não adicionar entrada no histórico
    window.location.replace(destinationUrl)
  }, [])

  // Retorna null pois o componente não renderiza nada (redireciona imediatamente)
  return null
}


/**
 * Helper para carregar imagens da pasta public
 * Tenta diferentes variações do caminho para garantir compatibilidade
 */
export const loadImage = (imagePath) => {
  // Remove barras iniciais duplicadas e normaliza o caminho
  const normalizedPath = imagePath.replace(/^\/+/, '').replace(/\/+/g, '/')
  
  // Retorna o caminho com barra inicial (padrão Vite)
  return `/${normalizedPath}`
}

/**
 * Verifica se uma imagem existe e retorna o caminho correto
 */
export const getImageSrc = (relativePath) => {
  // Garante que o caminho comece com / para ser absoluto a partir da raiz
  if (!relativePath.startsWith('/')) {
    return `/${relativePath}`
  }
  return relativePath
}

/**
 * Cria um handler de erro para imagens que tenta caminhos alternativos
 */
export const createImageErrorHandler = (originalPath, altPaths = []) => {
  return (e) => {
    const target = e.target
    const currentSrc = target.src
    
    // Lista de caminhos para tentar (incluindo o original e alternativos)
    const pathsToTry = [
      originalPath,
      ...altPaths,
      originalPath.replace(/^\//, ''), // Sem barra inicial
      `/${originalPath.replace(/^\//, '')}`, // Com barra inicial
    ]
    
    // Remove duplicatas
    const uniquePaths = [...new Set(pathsToTry)]
    
    // Encontra o índice do caminho atual
    const currentIndex = uniquePaths.findIndex(path => 
      currentSrc.includes(path.replace(/^\//, ''))
    )
    
    // Tenta o próximo caminho
    if (currentIndex < uniquePaths.length - 1) {
      const nextPath = uniquePaths[currentIndex + 1]
      console.log(`[ImageLoader] Tentando caminho alternativo: ${nextPath}`)
      target.src = nextPath.startsWith('http') ? nextPath : `${window.location.origin}${nextPath}`
    } else {
      // Se todos os caminhos falharam, esconde a imagem
      console.error(`[ImageLoader] ❌ Não foi possível carregar a imagem: ${originalPath}`)
      console.error(`[ImageLoader] Caminhos tentados:`, uniquePaths)
      target.style.display = 'none'
    }
  }
}

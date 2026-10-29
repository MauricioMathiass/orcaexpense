// O frontend cria os ids dos registros (ex.: "card-1730000000000"). No banco eles ficam com o id do
// usuário na frente: dois usuários nunca colidem e ninguém consegue sobrescrever a linha de outro.

export const scopeId = (userId, id) => `${userId}:${id}`

export const unscopeId = (id) => (id == null ? id : id.slice(id.indexOf(':') + 1))

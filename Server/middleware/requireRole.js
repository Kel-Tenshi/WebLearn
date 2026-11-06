// Пропускает запрос дальше, только если роль пользователя входит в список разрешённых.
// Использовать ПОСЛЕ authMiddleware (он кладёт роль в req.userRole).
//
// Пример: router.post('/', requireRole('manager', 'admin'), handler)
//
// 401 — «мы не знаем, кто вы» (это делает authMiddleware)
// 403 — «мы знаем, кто вы, но вам нельзя» (это делает этот middleware)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Недостаточно прав для этого действия' });
    }
    next();
  };
}

module.exports = requireRole;

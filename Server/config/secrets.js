// Секреты для подписи JWT.
// Вынесены в отдельный файл, чтобы не держать их в общем constants.js.
// Для учебного проекта хранятся здесь; в реальном проекте их место — переменные окружения.
module.exports = {
  JWT_ACCESS_SECRET:
    '486ed345c4fa688cd7d88af4c5755fdadccb42763c3df37078487932eec044e0a4f745be9f599eb7b26b7e7ed1796d1a',
  JWT_REFRESH_SECRET:
    '357a6d5d3944dcc8506cec41e16a4c1425b65fbc9f51920ae82ee80090b93272d2ae3d92a405ae1b3a37efdf0f9412a7'
};

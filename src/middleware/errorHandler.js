export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, error: "JSON inválido" });
  }

  const pgCode = err.code || err.cause?.code;
  if (pgCode === "23503") {
    return res.status(400).json({
      ok: false,
      error: "Referencia inválida: el usuario o departamento no existe",
    });
  }

  const status = err.status || 500;
  const message =
    status === 500 ? "Error interno del servidor" : err.message || "Error";

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    error: message,
  });
}

export function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
}

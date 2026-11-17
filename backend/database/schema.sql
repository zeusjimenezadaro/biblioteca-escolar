-- Estructura de la base de datos de la Biblioteca Escolar (MySQL 8 / MariaDB 10.4+).
-- Se puede ejecutar varias veces: solo crea lo que todavía no existe.

-- Usuarios del sistema. El rol define qué puede hacer cada uno.
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(161) NULL, -- NULL si la cuenta solo entra con una red social.
  role ENUM('admin', 'bibliotecario', 'alumno') NOT NULL DEFAULT 'alumno',
  active TINYINT(1) NOT NULL DEFAULT 1, -- Un administrador puede desactivar cuentas.
  avatar_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cuentas de Google, GitHub o Discord vinculadas a un usuario.
CREATE TABLE IF NOT EXISTS social_accounts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  provider ENUM('google', 'github', 'discord') NOT NULL,
  provider_user_id VARCHAR(100) NOT NULL, -- Identificador del usuario en esa red.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_social (provider, provider_user_id),
  CONSTRAINT fk_social_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tokens de renovación emitidos. Guardar su id permite revocarlos (cerrar sesión).
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY, -- Identificador único (jti) del token.
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL, -- Fecha en que se usó o se cerró la sesión.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Códigos de un solo uso que la app canjea por tokens después de entrar con una red social.
CREATE TABLE IF NOT EXISTS oauth_codes (
  code_hash CHAR(64) NOT NULL PRIMARY KEY, -- Se guarda el hash, nunca el código.
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  CONSTRAINT fk_code_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Libros del catálogo.
CREATE TABLE IF NOT EXISTS books (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150) NOT NULL,
  isbn VARCHAR(17) NULL UNIQUE,
  category VARCHAR(60) NOT NULL,
  year SMALLINT NULL,
  total_copies INT UNSIGNED NOT NULL DEFAULT 1,
  available_copies INT UNSIGNED NOT NULL DEFAULT 1, -- Ejemplares que no están prestados.
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_copies CHECK (available_copies <= total_copies)
);

-- Préstamos: un alumno lo pide y un bibliotecario lo aprueba, rechaza o registra la devolución.
CREATE TABLE IF NOT EXISTS loans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('pendiente', 'aprobado', 'rechazado', 'devuelto') NOT NULL DEFAULT 'pendiente',
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME NULL, -- Cuándo se aprobó o rechazó.
  decided_by INT UNSIGNED NULL, -- Quién lo aprobó o rechazó.
  due_date DATE NULL, -- Fecha límite de devolución.
  returned_at DATETIME NULL,
  INDEX idx_loans_status (status),
  CONSTRAINT fk_loan_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT fk_loan_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_loan_decider FOREIGN KEY (decided_by) REFERENCES users (id) ON DELETE SET NULL
);

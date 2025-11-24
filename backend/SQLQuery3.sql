USE flater_db;
GO
CREATE TABLE dbo.[users] (
  id             NVARCHAR(50)  NOT NULL PRIMARY KEY,
  email          NVARCHAR(255) NOT NULL UNIQUE,
  password       NVARCHAR(255) NOT NULL,
  firstName      NVARCHAR(100) NULL,
  lastName       NVARCHAR(100) NULL,
  activationLink NVARCHAR(100) NULL,
  isActivated    BIT NOT NULL DEFAULT(0),
  createdAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE TABLE dbo.[tokens] (
  id            INT IDENTITY(1,1) PRIMARY KEY,
  userId        NVARCHAR(50) NOT NULL,
  refreshToken  NVARCHAR(800) NOT NULL,
  createdAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_tokens_users FOREIGN KEY (userId) REFERENCES dbo.[users](id) ON DELETE CASCADE
);
CREATE INDEX IX_users_email ON dbo.[users](email);
CREATE INDEX IX_tokens_userId ON dbo.[tokens](userId);
CREATE INDEX IX_tokens_refreshToken ON dbo.[tokens](refreshToken);

ALTER TABLE dbo.[users] ADD avatarUrl NVARCHAR(500) NULL;

CREATE TABLE advertisements (
    id NVARCHAR(255) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    street NVARCHAR(100) NOT NULL,
    countOfRooms INT NOT NULL,
    images NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
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

CREATE TABLE favorite_advertisements (
    id NVARCHAR(36) PRIMARY KEY,
    user_id NVARCHAR(36) NOT NULL,
    advertisement_id NVARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE booking_advertisement (
    id NVARCHAR(100) PRIMARY KEY,
    user_id NVARCHAR(100) NOT NULL,
    advertisement_id NVARCHAR(100) NOT NULL,
    create_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    senderId NVARCHAR(50) NOT NULL,    -- ID отправителя (FK на users)
    recipientId NVARCHAR(50) NOT NULL, -- ID получателя (FK на users)
    content NVARCHAR(MAX) NOT NULL,    -- Текст сообщения
    isRead BIT DEFAULT 0,              -- Прочитано ли (0 - нет, 1 - да)
    createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    FOREIGN KEY (senderId) REFERENCES dbo.[users](id), -- Опционально, но полезно для целостности
    FOREIGN KEY (recipientId) REFERENCES dbo.[users](id)
);
-- Индексы для ускорения поиска переписки (ОЧЕНЬ ВАЖНО)
CREATE INDEX IX_messages_sender_recipient ON messages(senderId, recipientId);
CREATE INDEX IX_messages_recipient_sender ON messages(recipientId, senderId);

ALTER TABLE messages
ADD advertisementId NVARCHAR(255) NULL;
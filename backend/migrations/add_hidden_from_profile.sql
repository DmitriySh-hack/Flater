-- Выполнить один раз в базе flater_db, если таблица orders уже создана
USE flater_db;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.orders') AND name = 'hidden_from_profile'
)
BEGIN
    ALTER TABLE dbo.orders
    ADD hidden_from_profile BIT NOT NULL
        CONSTRAINT DF_orders_hidden_from_profile DEFAULT 0;
END
GO

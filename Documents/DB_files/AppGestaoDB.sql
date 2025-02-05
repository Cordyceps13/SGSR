/*=========================================================================================================================================*/
/* 																																		   */
/* 																CREATE DATABASE														       */
/* 																										 								   */
/*=========================================================================================================================================*/

GO
USE MASTER
IF DB_ID('APP_GESTAO_DB') IS NOT NULL
	DROP DATABASE APP_GESTAO_DB

CREATE DATABASE APP_GESTAO_DB

/*=========================================================================================================================================*/
/* 																																		   */
/* 													DROP TABLE SE EXISTIREM (IF OBJECT_ID)										           */
/* 																																		   */
/*=========================================================================================================================================*/
GO
USE APP_GESTAO_DB

GO
IF OBJECT_ID('SALAS_RECURSOS','U') IS NOT NULL
   DROP TABLE SALAS_RECURSOS

IF OBJECT_ID('RESERVAS_RECURSOS','U') IS NOT NULL
   DROP TABLE RESERVAS_RECURSOS

IF OBJECT_ID('RECURSOS','U') IS NOT NULL
   DROP TABLE RECURSOS

IF OBJECT_ID('EQUIPAMENTOS','U') IS NOT NULL
   DROP TABLE EQUIPAMENTOS

IF OBJECT_ID('BEBIDA','U') IS NOT NULL
   DROP TABLE BEBIDA

IF OBJECT_ID('COMIDA','U') IS NOT NULL
   DROP TABLE COMIDA

IF OBJECT_ID('RESERVAS','U') IS NOT NULL
   DROP TABLE RESERVAS

IF OBJECT_ID('SALAS','U') IS NOT NULL
   DROP TABLE SALAS

IF OBJECT_ID('UTILIZADORES','U') IS NOT NULL
   DROP TABLE UTILIZADORES

/*=========================================================================================================================================*/
/* 																																		   */
/* 																CREATE TABLES													           */
/* 																																		   */
/*=========================================================================================================================================*/

CREATE TABLE UTILIZADORES 
(
	ID		            		INT           	PRIMARY KEY IDENTITY(1,1),
	NOME						VARCHAR(50)   	NOT NULL,
	PW							VARCHAR(256)	NOT NULL,
	TIPO						TINYINT			NOT NULL,
	
);


/*=========================================================================================================================================*/


CREATE TABLE SALAS 
(
	ID		            		INT           	PRIMARY KEY IDENTITY(1,1),
	NOME						VARCHAR(20)   	NOT NULL,
	CAPACIDADE					INT				NOT NULL,
	
);


/*=========================================================================================================================================*/


CREATE TABLE RESERVAS 
(
	ID							INT           	PRIMARY KEY IDENTITY(1,1),
	MOTIVO						VARCHAR(20)		NOT NULL,
	DESCRICAO					VARCHAR(100)	NOT NULL,
	DATA						DATETIME	   	NOT NULL,
	H_INICIO					TIME			DEFAULT '00:00:00',
	H_FIM						TIME			DEFAULT '00:00:00',
	NUM_PESSOAS					INT				NOT NULL,
	CHECK_IN					TINYINT			DEFAULT 0 CHECK (CHECK_IN IN(0,1)),
	ESTADO						VARCHAR(10)		DEFAULT 'Pendente' CHECK (ESTADO IN('Pendente', 'Confirmada', 'Ativa', 'Cancelada', 'Expirada')),
	EXTRAS						TINYINT			DEFAULT 0 CHECK (EXTRAS IN(0,1)),
	ID_U						INT				NOT NULL,
	ID_S						INT				NOT NULL,

	CONSTRAINT FK_RESERVAS_UTILIZADORES FOREIGN KEY (ID_U) REFERENCES UTILIZADORES (ID),
	CONSTRAINT FK_RESERVAS_SALAS FOREIGN KEY (ID_S) REFERENCES SALAS (ID)
);


/*=========================================================================================================================================*/


CREATE TABLE EQUIPAMENTOS 
(
	ID		            		INT           	PRIMARY KEY IDENTITY(1,1),
	DESIGNACAO					VARCHAR(20)   	NOT NULL,
	STOCK						INT				DEFAULT 0,
	ID_S						INT				NOT NULL,

	CONSTRAINT FK_EQUIPAMENTOS_SALAS FOREIGN KEY (ID_S) REFERENCES SALAS (ID)
);


/*=========================================================================================================================================*/


CREATE TABLE EXTRAS 
(
	ID		            		INT           	PRIMARY KEY IDENTITY(1,1),
	DESCRICAO					VARCHAR(20)   	NOT NULL CHECK (DESCRICAO IN('Comida', 'Bebida', 'Equipamento')),
	ESTADO						VARCHAR(20)		NOT NULL CHECK (ESTADO IN ('Pendente', 'Aprovado', 'Rejeitado')),
	QUANTIDADE					INT				NOT NULL DEFAULT 1,
	ID_R						INT				NOT NULL,

	CONSTRAINT FK_EXTRAS_RESERVAS FOREIGN KEY (ID_R) REFERENCES RESERVAS (ID)
	
);
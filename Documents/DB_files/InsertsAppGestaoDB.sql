/*=========================================================================================================================================*/
/* 																																		   */
/* 																INSERTS																	   */
/* 																										 								   */
/*=========================================================================================================================================*/
GO
USE APP_GESTAO_DB

GO
/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT UTILIZADORES															   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO UTILIZADORES (NOME, PW, TIPO) VALUES 
('Ana', 'password123', 1), 
('Joao', 'joaopw', 2),
('Maria', 'mariapw', 2),
('Carlos', 'carlospw', 2);

/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT SALAS																	   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO SALAS (NOME, CAPACIDADE) VALUES
('Sala Musk', 6),
('Sala Bezos', 4),
('Sala Gates', 4),
('Sala Jobs', 10);

/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT COMIDA																	   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO COMIDA (DESIGNACAO, STOCK) VALUES
('Bolo', 20),
('Salgadinhos', 50),
('Pizza', 30);

/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT BEBIDA																	   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO BEBIDA (DESIGNACAO, STOCK) VALUES
('�gua', 100),
('Sumo', 50),
('Caf�', 70);

/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT EQUIPAMENTOS															   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO EQUIPAMENTOS (DESIGNACAO, STOCK) VALUES
('Projetor', 4),
('Computador', 10),
('Colunas', 10),
('TV', 4),
('Quadro', 4);

/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT RECURSOS																   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO RECURSOS (TIPO, ID_COMIDA) VALUES
('Comida', 1), -- Bolo
('Comida', 2), -- Salgadinhos
('Comida', 3); -- Pizza
INSERT INTO RECURSOS (TIPO, ID_BEBIDA) VALUES
('Bebida', 1), -- �gua
('Bebida', 2), -- Sumo
('Bebida', 3); -- Caf�
INSERT INTO RECURSOS (TIPO, ID_EQUIPAMENTO) VALUES
('Equipamento', 1), -- Projetor
('Equipamento', 2), -- Computador
('Equipamento', 3), -- Colunas
('Equipamento', 4), -- TV
('Equipamento', 5); -- Quadro

/*=========================================================================================================================================*/
/* 																																		   */
/* 														INSERT RESERVAS																   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO RESERVAS (DATA, H_INICIO, H_FIM, NUM_PESSOAS, CHECK_IN, ESTADO, ID_U, ID_S) VALUES
(GETDATE(), '09:00:00', '11:00:00', 8, 0, 'Pendente', 2, 1), -- Jo�o na Sala A
(GETDATE(), '14:00:00', '16:00:00', 12, 0, 'Pendente', 3, 2), -- Maria na Sala B
(GETDATE(), '10:00:00', '13:00:00', 10, 1, 'Confirmada', 4, 3); -- Carlos na Sala C

/*=========================================================================================================================================*/
/* 																																		   */
/* 													INSERT RESERVAS_RECURSOS															   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO RESERVAS_RECURSOS (ID_RESERVA, ID_RECURSO, QUANTIDADE) VALUES
(1, 1, 5), -- 5 Bolos para Reserva 1
(1, 4, 10), -- 10 �guas para Reserva 1
(1, 7, 1), -- 1 Projetor para Reserva 1
(2, 3, 8), -- 8 Pizzas para Reserva 2
(2, 5, 6), -- 6 Sucos para Reserva 2
(3, 2, 10), -- 10 Salgadinhos para Reserva 3
(3, 6, 5); -- 5 Caf�s para Reserva 3

/*=========================================================================================================================================*/
/* 																																		   */
/* 													INSERT SALAS_RECURSOS																   */
/* 																																		   */
/*=========================================================================================================================================*/

INSERT INTO SALAS_RECURSOS (ID_SALA, ID_RECURSO, QUANTIDADE) VALUES
(1, 4, 1), -- Sala Musk com 1 TV
(3, 5, 1), -- Sala Gates com 1 Quadro
(4, 4, 1), -- Sala Jobs com 1 Quadro e 1 TV
(4, 5, 1);

SELECT * FROM COMIDA
SELECT * FROM BEBIDA
SELECT * FROM EQUIPAMENTOS
SELECT * FROM RECURSOS

update UTILIZADORES set NOME = ('caganita') where ID = 1

select * from UTILIZADORES
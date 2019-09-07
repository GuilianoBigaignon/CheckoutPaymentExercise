--Test 1 
INSERT INTO [dbo].[PAR_JEU_PARAMETRE] ([JEU_ID], [NOM], [DESCRIPTION], [ETAT], [VERSION], [RESTRICTION], [DATE_CREATION], [EDIT_USER],  [EDIT_START], [PARAM_TYPE]) VALUES (1,'TestNom','TestDescription','TestEtat','Test','Restiction',GETDATE(),'EditUserTest', GETDATE(), 'ICTGARE')
INSERT INTO [dbo].[PAR_JEU_PARAMETRE] ([JEU_ID], [NOM], [DESCRIPTION], [ETAT], [VERSION], [RESTRICTION], [DATE_CREATION], [EDIT_USER],  [EDIT_START], [PARAM_TYPE]) VALUES (2,'TestNom','TestDescription','TestEtat','Test','Restiction',GETDATE(),'EditUserTest', GETDATE(), 'ICTTITRE')

--Test  Accepte pas EMB & DEB
INSERT [dbo].[PAR_JEU_PARAMETRE] ([JEU_ID], [NOM], [DESCRIPTION], [ETAT], [VERSION], [RESTRICTION], [DATE_CREATION], [EDIT_USER], [EDIT_START], [PARAM_TYPE]) VALUES (11, 'Jeu de paramètre des ictpgen', 'test de Validation Machine  PSL', 'ENDEF', NULL, 'EQP', GETDATE(), NULL, NULL, 'ICTPGEN')
--Test 2 N'accepte pas EMB & DEB
INSERT [dbo].[PAR_JEU_PARAMETRE] ([JEU_ID], [NOM], [DESCRIPTION], [ETAT], [VERSION], [RESTRICTION], [DATE_CREATION], [EDIT_USER], [EDIT_START], [PARAM_TYPE]) VALUES (12, 'Jeu de paramètre des ictpgen', 'test de Validation Machine  PSL', 'ENDEF', NULL, 'EQP', GETDATE(), NULL, NULL, 'ICTPGEN')

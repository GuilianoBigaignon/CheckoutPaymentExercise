--AntipassBack en cours 
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (51, 1, '1', 1, NULL, 123456, 'E', GETDATE(),DATEADD(day, 1, GETDATE()))
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (52, 2, '1', NULL, 2, 123456, 'S', GETDATE(),DATEADD(day, 1, GETDATE()))
                                                                                                                                                                                                         
--AntipassBack expiré MAIS avec un client qui a des titre dans le delais antiPassBack                                                                                                                    
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (53, 3, '1', 3, NULL, 123456, 'E', DATEADD(day, -1, GETDATE()),DATEADD(hour, 1, GETDATE()))
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (54, 4, '1', NULL, 4, 123456, 'S', DATEADD(day, -1, GETDATE()),DATEADD(hour, 1, GETDATE()))
                                                                                                                                                                                                         
                                                                                                                                                                                                         
--AntipassBack expiré                                                                                                                                                                                    
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (55, 3, '1', 5, NULL, 123456, 'E', DATEADD(day, -2, GETDATE()),DATEADD(day, -1, GETDATE()))
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (56, 4, '1', NULL, 6, 123456, 'S', DATEADD(day, -2, GETDATE()),DATEADD(day, -1, GETDATE()))


--Test inssertion UniqueUsage
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (57, 30, '1', 11, NULL, 123456, 'E', DATEADD(day, -2, GETDATE()),DATEADD(day, -1, GETDATE()))
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (58, 31, '1', NULL, 20, 123456, 'S', DATEADD(day, 1, GETDATE()),DATEADD(day, 2, GETDATE()))


--Test inssertion MultiUsage
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (59, 32, '1', 7, NULL, 654321, 'E', DATEADD(day, -2, GETDATE()),DATEADD(day, -1, GETDATE()))
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (60, 33, '1', NULL, 18, 654321, 'S', DATEADD(day, 1, GETDATE()),DATEADD(day, 2, GETDATE()))


 --Test delete corelation ID
INSERT [dbo].[VAL_ANTIPASSBACK] ([ID], [CORRELATION_ID_VAL], [TYPE_CANAL], [ID_TITRE], [ID_CLIENT], [GARE_VALIDATION], [SENS_PASSAGE], [DATE_VALIDATION],[DATE_FIN_ANTIPASSBACK]) VALUES (61, 62, '1', 63, 64, 654321, 'S', DATEADD(day, -2, GETDATE()),DATEADD(day, -1, GETDATE()))

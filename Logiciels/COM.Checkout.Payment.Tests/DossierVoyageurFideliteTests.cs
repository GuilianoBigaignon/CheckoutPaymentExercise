using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;
using System;
using ICTER.Online.Entity;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class DossierVoyageurFideliteTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitDossierVoyageurFideliteStub()
        {
            InsertData();
        }

        public DossierVoyageurFideliteTests() : base()
        {
        }

        [TestCleanup]
        public void CleanDb()
        {
            ResetDatabase(); //RAZ des données de la BDD
        }

        private void InsertData()
        {

            InsertData("ADM_GARE_Dossier_Fidelite", _conn);
            InsertData("ADM_GARE_ICTER_Dossier_Fidelite", _conn);
            InsertData("PAR_JEU_PARAMETRE_DOSSIER_Fidelite", _conn);

            InsertData("PAR_GARE_LIEE_Dossier_Fidelite", _conn);
            InsertData("PAR_ICTPGEN_DOSSIER_Fidelite", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            InsertData("PAR_CONFIGURATION", _conn);
            InsertData("PAR_ASS_CONF_PARAM", _conn);

            InsertData("LDV_PARAMETRAGE", _connICTER);
            InsertData("LDV_DOSSIER_VOYAGE_Dossier_Fidelite", _connICTER);
            InsertData("LDV_GARE_Dossier_Fidelite", _connICTER);
            InsertData("LDV_COURSE_Dossier_Fidelite", _connICTER);
            InsertData("LDV_TICKET_Dossier_Fidelite", _connICTER);
            InsertData("LDV_SEGMENT_Dossier_Fidelite", _connICTER);
            InsertData("LDV_TICKET_MARK_INFORMATION_Dossier_Fidelite", _connICTER);
            InsertData("LDV_PASSAGER_Dossier_Fidelite", _connICTER);

        }

        [TestMethod]
        public void Test_PS01_02_R14()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverDossierVoyageurFidelite = scope.Resolve<IDossierVoyageurFideliteService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                var now = DateTime.Now;
                var ticket = new TicketValidationEntity(); 
               
                resolverCache.SetCache();


                // Tests GetTicketOriginOnListDV == 0

                // Test 1 : Accepte cartes EMB et DEB - Entrée et sortie   
                Assert.AreEqual(CodeRetourValue.A1_CB2D, resolverDossierVoyageurFidelite
                    .TraitementDossierVoyageCarteFidelite(_connICTER, 123456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist"), out ticket));
                Assert.AreEqual(CodeRetourValue.A1_CB2D, resolverDossierVoyageurFidelite
                     .TraitementDossierVoyageCarteFidelite(_connICTER, 123456, "LOYALTY_NUMBER1", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist"), out ticket));

                //Test 2 : N'accepte pas cartes EMB ni DEB - Entrée et sortie   
                Assert.AreEqual(CodeRetourValue.R20_CB2D, resolverDossierVoyageurFidelite
                    .TraitementDossierVoyageCarteFidelite(_connICTER, 123456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist2"), out ticket));
                Assert.AreEqual(CodeRetourValue.R20_CB2D, resolverDossierVoyageurFidelite
                     .TraitementDossierVoyageCarteFidelite(_connICTER, 123456, "LOYALTY_NUMBER1", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist2"), out ticket));


                // Tests GetTicketOriginOnListDV != 0

                // Test 3 : Accepte cartes EMB et DEB - Entrée et sortie  - Non Composté 
                Assert.AreEqual(null, resolverDossierVoyageurFidelite
                    .TraitementDossierVoyageCarteFidelite(_connICTER, 456456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist3"), out ticket));
                Assert.AreEqual(null, resolverDossierVoyageurFidelite
                     .TraitementDossierVoyageCarteFidelite(_connICTER, 456456, "LOYALTY_NUMBER1", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist3"), out ticket));

                // Test 4 : N'accepte pas cartes EMB ni DEB - Entrée et sortie  - Non Composté 
                Assert.AreEqual(null, resolverDossierVoyageurFidelite
                       .TraitementDossierVoyageCarteFidelite(_connICTER, 456456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist4"), out ticket));
                Assert.AreEqual(null, resolverDossierVoyageurFidelite
                     .TraitementDossierVoyageCarteFidelite(_connICTER, 456456, "LOYALTY_NUMBER1", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist4"), out ticket));

                // Test 5 : Accepte cartes EMB et DEB - Entrée composté (Pending Stamped (+1jour) )
                Assert.AreEqual(CodeRetourValue.A1_CB2D, resolverDossierVoyageurFidelite
                   .TraitementDossierVoyageCarteFidelite(_connICTER, 789456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist5"), out ticket));
                Assert.AreEqual(CodeRetourValue.A1_CB2D, resolverDossierVoyageurFidelite
                   .TraitementDossierVoyageCarteFidelite(_connICTER, 789456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist5"), out ticket));

                // Test 6 : N'accepte pas cartes EMB ni DEB - Entrée composté ( Stamped)
                Assert.AreEqual(CodeRetourValue.R21_CB2D, resolverDossierVoyageurFidelite
                  .TraitementDossierVoyageCarteFidelite(_connICTER, 789456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist6"), out ticket));
                Assert.AreEqual(CodeRetourValue.R21_CB2D, resolverDossierVoyageurFidelite
                    .TraitementDossierVoyageCarteFidelite(_connICTER, 789456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist6"), out ticket));

                // Test 7 : Pas de gare liée 
                Assert.AreEqual(CodeRetourValue.R100_CB2D, resolverDossierVoyageurFidelite
                  .TraitementDossierVoyageCarteFidelite(_connICTER, 147456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist7"), out ticket));

                // Test 8 : activation de la liste DV = false
                UpdateData("LDV_PARAMETRAGE_Update_0", _connICTER);
                resolverDossierVoyageurFidelite = scope.Resolve<IDossierVoyageurFideliteService>();
                resolverCache.SetCache();
                Assert.AreEqual(CodeRetourValue.A3_CB2D, resolverDossierVoyageurFidelite
                    .TraitementDossierVoyageCarteFidelite(_connICTER, 123456, "LOYALTY_NUMBER1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist"), out ticket));


            }
        }
    }
}

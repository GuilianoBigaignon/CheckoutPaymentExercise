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
    public class DossierVoyageurAutreTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public DossierVoyageurAutreTests() : base()
        {

        }

        [TestCleanup]
        public void CleanDb()
        {
            ResetDatabase(); //RAZ des données de la BDD
        }

        public void InitDb()
        {
            InsertData();
        }

        private void InsertData()
        {
            InsertData("ADM_GARE_Dossier_Autre", _conn);
            InsertData("ADM_GARE_ICTER_Dossier_Autre", _conn);
            InsertData("PAR_JEU_PARAMETRE_Dossier_Autre", _conn);

            InsertData("PAR_GARE_LIEE_Dossier_Autre", _conn);
            InsertData("PAR_ICTPGEN_Dossier_Autre", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT_Dossier_Autre", _conn);
            InsertData("PAR_CONFIGURATION_Dossier_Autre", _conn);
            InsertData("PAR_ASS_CONF_PARAM_Dossier_Autre", _conn);

            InsertData("LDV_PARAMETRAGE", _connICTER);
            InsertData("LDV_DOSSIER_VOYAGE_Dossier_Autre", _connICTER);
            InsertData("LDV_GARE_Dossier_Autre", _connICTER);
            InsertData("LDV_COURSE_Dossier_Autre", _connICTER);
            InsertData("LDV_TICKET_Dossier_Autre", _connICTER);
            InsertData("LDV_SEGMENT_Dossier_Autre", _connICTER);
            InsertData("LDV_TICKET_MARK_INFORMATION_Dossier_Autre", _connICTER);
            InsertData("LDV_PASSAGER_Dossier_Autre", _connICTER);
        }

        [TestMethod]
        public void Test_PS01_02_R15()
        {
            using (var scope = _container.BeginLifetimeScope())
            {

                var resolverDossierVoyageurAutre = scope.Resolve<IDossierVoyageurAutreService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                var now = DateTime.Now;
                var ticket = new TicketValidationEntity();


                resolverCache.SetCache();


                // Test 1 : Avec ticket Actif & contenu dans l'origine - Accepte cartes EMB et DEB - Entrée et sortie   
                Assert.AreEqual(null, resolverDossierVoyageurAutre
                    .TraitementDossierVoyageAutre(_connICTER, 123456, "TCN1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist"), out ticket));
                Assert.AreEqual(null, resolverDossierVoyageurAutre
                     .TraitementDossierVoyageAutre(_connICTER, 123456, "TCN1", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist"), out ticket));

                //Test 2 : Avec ticket Actif & contenu dans l'origine  - N'accepte pas cartes EMB ni DEB - Entrée et sortie   
                Assert.AreEqual(null, resolverDossierVoyageurAutre
                    .TraitementDossierVoyageAutre(_connICTER, 123456, "TCN1", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist2"), out ticket));
                Assert.AreEqual(null, resolverDossierVoyageurAutre
                     .TraitementDossierVoyageAutre(_connICTER, 123456, "TCN1", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist2"), out ticket));


                //Test 3 : Avec ticket Actif & NON contenu dans l'origine  
                Assert.AreEqual(CodeRetourValue.R19_CB2D, resolverDossierVoyageurAutre
                    .TraitementDossierVoyageAutre(_connICTER, 321456, "TCN2", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist3"), out ticket));

                Assert.AreEqual(CodeRetourValue.R19_CB2D, resolverDossierVoyageurAutre
                    .TraitementDossierVoyageAutre(_connICTER, 321456, "TCN2", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist3"), out ticket));

                //Test 4 Avec ticket Actif & contenu dans l'origine  deja composté
                Assert.AreEqual(CodeRetourValue.R19_CB2D, resolverDossierVoyageurAutre
                                   .TraitementDossierVoyageAutre(_connICTER, 456456, "TCN3", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist4"), out ticket));
                Assert.AreEqual(null, resolverDossierVoyageurAutre
                                  .TraitementDossierVoyageAutre(_connICTER, 654456, "TCN4", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist5"), out ticket));

                //Test 5 Sans Ticket trouvé - Accepte cartes EMB et DEB - Entrée et sortie   
                Assert.AreEqual(CodeRetourValue.A1_CB2D, resolverDossierVoyageurAutre
                                   .TraitementDossierVoyageAutre(_connICTER, 111456, "TCN", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist6"), out ticket));
                Assert.AreEqual(CodeRetourValue.A1_CB2D, resolverDossierVoyageurAutre
                                  .TraitementDossierVoyageAutre(_connICTER, 111456, "TCN", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist6"), out ticket));

                //Test 6 Sans Ticket trouvé - N'accepte pas cartes EMB et DEB - Entrée et sortie   
                Assert.AreEqual(CodeRetourValue.R18_CB2D, resolverDossierVoyageurAutre
                                   .TraitementDossierVoyageAutre(_connICTER, 111456, "TCN", SensPassage.ENTREE, now, resolverCache.GetCacheParamByGroupId("TestExist7"), out ticket));
                Assert.AreEqual(CodeRetourValue.R18_CB2D, resolverDossierVoyageurAutre
                                  .TraitementDossierVoyageAutre(_connICTER, 222456, "TCN", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist7"), out ticket));

                // Test 7 : activation de la liste DV = false
                UpdateData("LDV_PARAMETRAGE_Update_0", _connICTER);
                resolverDossierVoyageurAutre = scope.Resolve<IDossierVoyageurAutreService>();
                resolverCache.SetCache();
                Assert.AreEqual(CodeRetourValue.A3_CB2D, resolverDossierVoyageurAutre
                                .TraitementDossierVoyageAutre(_connICTER, 222456, "TCN", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist7"), out ticket));

                
                //Test 8 : codeRR == null 
                Assert.AreEqual(CodeRetourValue.R100_CB2D, resolverDossierVoyageurAutre
                     .TraitementDossierVoyageAutre(_connICTER, 789456, "TCN", SensPassage.SORTIE, now, resolverCache.GetCacheParamByGroupId("TestExist2"), out ticket));
            }
        }
    }
}

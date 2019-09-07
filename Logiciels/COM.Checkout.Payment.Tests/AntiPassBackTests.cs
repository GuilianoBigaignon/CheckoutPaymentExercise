using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;
using System;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class AntiPassBackTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public AntiPassBackTests() : base()
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
            //InsertData("PAR_JEU_PARAMETRE_CODETARIF", _conn);
            //InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            //InsertData("PAR_CONFIGURATION", _conn);
            //InsertData("PAR_ASS_CONF_PARAM_CODETARIF", _conn);
            //InsertData("PAR_TARIF", _conn);
            InsertData("VAL_ANTIPASSBACK_AntiPassBack", _connICTER);

        }

        [TestMethod]
        // - Vérifier antipassback server selon delai
        public void Test_PS01_02_R21()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverAntiPassBakc = scope.Resolve<IAntiPassBackService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                resolverCache.SetCache();

                //AntipassBack juste absent
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, "99", null, "123456", SensPassage.ENTREE, DateTime.Now.AddHours(1), 240));
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "99", "123456", SensPassage.ENTREE, DateTime.Now.AddHours(1), 240));

                //AntipassBack expiré MAIS avec un client qui a des titres dans le delais antiPassBack
                // même sens mais pendant la periode anti passback
                Assert.AreEqual(true, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, "3", null, "123456", SensPassage.ENTREE, DateTime.Now, 240));
                // sens différent 
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, "3", null, "123456", SensPassage.SORTIE, DateTime.Now, 240));
                // même sens mais en dehors de la periode anti passback
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "4", "123456", SensPassage.SORTIE, DateTime.Now.AddHours(2), 240));
                // même sens mais pendant la periode anti passback
                Assert.AreEqual(true, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "4", "123456", SensPassage.SORTIE, DateTime.Now, 240));
                // sens différent 
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "4", "123456", SensPassage.ENTREE, DateTime.Now, 240));

                // Pendant la periode anti passback
                Assert.AreEqual(true, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, "1", null, "123456", SensPassage.ENTREE, DateTime.Now.AddHours(1), 240));
                Assert.AreEqual(true, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "2", "123456", SensPassage.SORTIE, DateTime.Now.AddHours(1), 240));


                // En dehors de la periode anti passback
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, "5", null, "123456", SensPassage.ENTREE, DateTime.Now, 240));
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDelai(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "6", "123456", SensPassage.SORTIE, DateTime.Now.AddHours(5), 240));
            }
        }

        [TestMethod]
        //Vérifier antipassback server selon DEV
        public void Test_PS01_02_R22()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverAntiPassBack = scope.Resolve<IAntiPassBackService>();
              

                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "2", "123456", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "2", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
            }
        }

        [TestMethod]
        //Vérifier antipassback server selon DEV
        public void Test_PS01_04_R01()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverAntiPassBack = scope.Resolve<IAntiPassBackService>();

                // Test IdClient IdTitre
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "100", TypeCanalEnum.Canal_SECUTIX, "1000", "100", "654321", SensPassage.SORTIE, DateTime.Now, false, true, 10, 20, DateTime.Now.AddHours(2));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "101", TypeCanalEnum.Canal_SECUTIX, "1001", "100", "654321", SensPassage.SORTIE, DateTime.Now, false, true, 10, 20, DateTime.Now.AddHours(2));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "102", TypeCanalEnum.Canal_SECUTIX, string.Empty, "100", "654321", SensPassage.SORTIE, DateTime.Now, false, true, 10, 20, DateTime.Now.AddHours(2));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "103", TypeCanalEnum.Canal_SECUTIX, "1000", null, "654321", SensPassage.SORTIE, DateTime.Now, false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "9", "100", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "100", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "1000", "2", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "1000", "100", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "1000", null, "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));

                //IsDV && isUsageUnique 
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "2", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1),0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "10", TypeCanalEnum.Canal_SECUTIX, null, "2", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, null, "2", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1),0));

                // non connu
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "16", "12", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1),0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "20", TypeCanalEnum.Canal_SECUTIX, "16", "12", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "16", "12", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1),0));


                // isUsageMultiple
                // sens différent
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "7", null, "654321", SensPassage.SORTIE, DateTime.Now.AddHours(-25), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "11", TypeCanalEnum.Canal_SECUTIX, "7", "3", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), true, false, 10, 20, DateTime.Now.AddHours(2));
                // même sens que le précédent
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "7", "3", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1),0));

                // TAG TODO utilité du test après revu de IsAntiPassBackDEV ?
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "17", "13", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "21", TypeCanalEnum.Canal_SECUTIX, "17", "13", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), true, false, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "17", "13", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));


                // isUsageUnique 
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "8", "4", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "12", TypeCanalEnum.Canal_SECUTIX, "8", "4", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "8", "4", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));

                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "18", "14", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "22", TypeCanalEnum.Canal_SECUTIX, "18", "14", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "18", "14", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));

                // IsUsageUnique && DateTime.MinValue
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "9", "5", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "13", TypeCanalEnum.Canal_SECUTIX, "9", "5", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.MinValue);
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "9", "5", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));

                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "19", "15", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "23", TypeCanalEnum.Canal_SECUTIX, "19", "15", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.MinValue);
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "19", "15", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));



                // isUsageUniqueavec valeur ds la base 
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "10", "6", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "14", TypeCanalEnum.Canal_SECUTIX, "10", "6", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "10", "6", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1), 0));

                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "20", "16", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "24", TypeCanalEnum.Canal_SECUTIX, "20", "16", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(true, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "20", "16", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));


                // CorrelationID existe 
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "21", "17", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));
                resolverAntiPassBack.InsertDeleteAntiPassBack(_connICTER, "1", TypeCanalEnum.Canal_SECUTIX, "21", "17", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), false, true, 10, 20, DateTime.Now.AddHours(2));
                Assert.AreEqual(false, resolverAntiPassBack.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "21", "17", "654321", SensPassage.ENTREE, DateTime.Now.AddHours(1), 0));
            }
        }

        [TestMethod]
        public void Test_DeleteAntiPassBack()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverAntiPassBakc = scope.Resolve<IAntiPassBackService>();
             
                Assert.AreEqual(true, resolverAntiPassBakc.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "63", "64", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1),0));
                resolverAntiPassBakc.DeleteAntiPassBack(_connICTER, "62");
                Assert.AreEqual(false, resolverAntiPassBakc.IsAntiPassBackDEV(_connICTER, TypeCanalEnum.Canal_SECUTIX, "63", "64", "654321", SensPassage.SORTIE, DateTime.Now.AddHours(1),0));
            }
        }
    }

}

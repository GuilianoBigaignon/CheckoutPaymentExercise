using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class SupportProdServiceTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public SupportProdServiceTests() : base()
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
            InsertData("PAR_JEU_PARAMETRE_SupportProd", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            InsertData("PAR_CONFIGURATION", _conn);

            //InsertData("PAR_JEU_PARAMETRE_DOSSIER_Fidelite", _conn);


            InsertData("PAR_ASS_CONF_PARAM_SupportProd", _conn);
            InsertData("PAR_ICTPGEN_SupportProd", _conn);

        }

        [TestMethod]
        public void Test_PS01_02_R12()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverCodeTitre = scope.Resolve<ISupportProdService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                resolverCache.SetCache();
                Assert.AreEqual(null, resolverCodeTitre.TraitementSupportProd(false, resolverCache.GetCacheParamByGroupId("TestExist")));
                Assert.AreEqual(null, resolverCodeTitre.TraitementSupportProd(true, resolverCache.GetCacheParamByGroupId("TestExist")));

                Assert.AreEqual(null, resolverCodeTitre.TraitementSupportProd(false, resolverCache.GetCacheParamByGroupId("TestExist2")));
                Assert.AreEqual(CodeRetourValue.R9_CB2D, resolverCodeTitre.TraitementSupportProd(true, resolverCache.GetCacheParamByGroupId("TestExist2")));

            }

        }
    }
}

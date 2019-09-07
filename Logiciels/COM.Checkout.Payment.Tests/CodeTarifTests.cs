using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class ValidationTestsCodeTarifTest : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public ValidationTestsCodeTarifTest() : base()
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
            InsertData("PAR_JEU_PARAMETRE_CODETARIF", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            InsertData("PAR_CONFIGURATION", _conn);
            InsertData("PAR_ASS_CONF_PARAM_CODETARIF", _conn);
            InsertData("PAR_TARIF", _conn);
            InsertData("PAR_TARIF_CAR", _conn);

        }

        [TestMethod]
        public void Test_PS01_02_R20()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverCodeTitre = scope.Resolve<ICodeTarifService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                resolverCache.SetCache();
                Assert.AreEqual(null, resolverCodeTitre.TraitementCodeTarif("TestExist", "Test_Exist", resolverCache.GetCacheParamByGroupId("TestExist")));
                Assert.AreEqual(CodeRetourValue.R16_CB2D, resolverCodeTitre.TraitementCodeTarif("TestExist", "Test_NonExist", resolverCache.GetCacheParamByGroupId("TestExist")));

            }

        }
    }
}

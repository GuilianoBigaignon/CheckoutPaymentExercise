using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class ValidationTestsCodeTitreTest : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public ValidationTestsCodeTitreTest() : base()
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
            InsertData("PAR_JEU_PARAMETRE_CODETITRE", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            InsertData("PAR_CONFIGURATION", _conn);
            InsertData("PAR_ASS_CONF_PARAM_CODETITRE", _conn);
            InsertData("PAR_TITRE", _conn);

        }

        [TestMethod]
        public void Test_PS01_02_R10()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverCodeTitre = scope.Resolve<ICodeTitreService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                resolverCache.SetCache();
                Assert.AreEqual(null, resolverCodeTitre.TraitementCodeTitre("Test_Exist", resolverCache.GetCacheParamByGroupId("TestExist")));
                Assert.AreEqual(CodeRetourValue.R15_CB2D, resolverCodeTitre.TraitementCodeTitre("Test_NonExist", resolverCache.GetCacheParamByGroupId("TestExist")));

            }

        }
    }
}

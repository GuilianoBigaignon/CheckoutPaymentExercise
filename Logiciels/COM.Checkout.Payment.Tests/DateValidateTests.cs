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
    public class DateValidateTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public DateValidateTests() : base()
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
        }

        [TestMethod]
        public void Test_PS01_02_R13()
        {
            using (var scope = _container.BeginLifetimeScope())
            {

                var resolverCodeTitre = scope.Resolve<IDateValiditeService>();

                //(string dateHeureValidation, DateTime dateDebutValidite, DateTime dateFinValidite)
                var date = DateTime.Now.ToUniversalTime();
                Assert.AreEqual(null, resolverCodeTitre.TraitementDateValidite(date, date.AddHours(-1), date.AddHours(1)));

                // accepté car avant le lendemain 2h du matin
                Assert.AreEqual(null, resolverCodeTitre.TraitementDateValidite(date, date.AddHours(-5), date.AddHours(-4)));

                Assert.AreEqual(null, resolverCodeTitre.TraitementDateValidite(date, date.AddDays(-1), date.AddDays(1)));
                Assert.AreEqual(CodeRetourValue.R4_CB2D, resolverCodeTitre.TraitementDateValidite(date, date.AddHours(1), date.AddHours(2)));

            }

        }

    }
}

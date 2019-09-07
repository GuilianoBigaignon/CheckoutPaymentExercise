using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;
using ICTER.Online.Api.Contract;
using ICTER.Online.Api.ParseurCb2dSncfService.Domain;
using ICTER.Online.Entity;
using System;
using System.Reflection;
using System.Collections;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class PostValidationValidationTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public PostValidationValidationTests() : base()
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
            InsertData("ADM_Perimetre", _conn);
        }

        [TestMethod]
        public void Test_PS01_04_R03()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var PostValidationCompostage = scope.Resolve<IValidationService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                resolverCache.SetCache();

                var cb2d = new CB2DGenerique()
                {
                    Segment1 = new CB2DSegment
                    {
                        DateTrain = DateTime.Now,
                        Train = 10,
                    },
                    RefDossier = "10",
                    TCN = "TCN"
                };
                var req = new ValidationRequestDTO()
                {
                    typeTraitement = TypeTraitement.Rejeu,
                    correlationID = "10",
                    numeroCalife = "10",
                    dateHeureValidation = "10/10/10",
                    sensPassage = SensPassage.ENTREE,
                    empreinte = "1"
                };
                DateTime dateHeureValidation = new DateTime(2010, 10, 10);

                var codeRetour = CodeRetourValue.A0_CB2D;

                var validation1 = PostValidationCompostage.Validation(cb2d, req, dateHeureValidation, codeRetour, false);
                var validationAttendu1 = new Validation()
                {
                    correlationID = req.correlationID,
                    version = "1",
                    idCab = req.equipmentID,
                    sensValidation = req.sensPassage,
                    resultatValidation = codeRetour.Resultat,
                    typeCanal = req.typeCanal,
                    horodatage = dateHeureValidation.ToString("yyyyMMddHHmmss")
                };
                var validation2 = PostValidationCompostage.Validation(cb2d, req, dateHeureValidation,codeRetour, true);
                var validationAttendu2 = new Validation()
                {
                    correlationID = req.correlationID,
                    version = "1",
                    idCab = req.equipmentID,
                    sensValidation = req.sensPassage,
                    resultatValidation = codeRetour.Resultat,
                    typeCanal = req.typeCanal,
                    ise_Nse_Principal = "60",
                    ise_Nse_Secondaire = "60",
                    dv = cb2d.RefDossier,
                    destinationTrain = cb2d.Segment1?.Destination,
                    numeroTrain = cb2d.Segment1?.Train == null ? "0" : cb2d.Segment1?.Train?.ToString(),
                    origineTrain = cb2d.Segment1?.Origine,
                    horodatage = dateHeureValidation.ToString("yyyyMMddHHmmss")
                };

                PropertyValuesAreEquals(validationAttendu1, validation1);
                PropertyValuesAreEquals(validationAttendu2, validation2);
            }
        }


    private static void PropertyValuesAreEquals(object actual, object expected)
    {
        PropertyInfo[] properties = expected.GetType().GetProperties();
        foreach (PropertyInfo property in properties)
        {
            object expectedValue = property.GetValue(expected, null);
            object actualValue = property.GetValue(actual, null);
            if (!Equals(expectedValue, actualValue))
                Assert.Fail("");
        }
    }
}
}
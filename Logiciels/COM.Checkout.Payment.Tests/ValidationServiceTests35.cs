using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;
using System;
using ICTER.Online.Api.Contract;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class ValidationServiceTests35 : ValidationServiceTests
    {
        protected string buffer35 = "6545445654584A565147363137333339373431313131313030303030303030303020203032303238313835202020202020465241434B465250534C303333303220313239373235343030343032333150473034414820202020202020202020202020202020202020202020202020202020202A202020202020";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_RR;
        }

        [TestInitialize]
        public void InitListeDV35()
        {
            InsertData("LDV_CODE_BARRE_35", _connICTER);
        }

        #region code barre 35 avec liste DV

        [TestMethod]
        public void Test3501()
        {
            // titre auto porteur aller/retour sans liste DV - entree
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 23, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer35);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3502()
        {
            // titre auto porteur aller/retour sans liste DV - sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 02, 55, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer35);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3503()
        {
            // titre auto porteur aller/retour sans liste DV - sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 01, 55, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer35);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3504()
        {
            // délai aller/retour est atteint
            Test3503();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 23, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param6", buffer35);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3505()
        {
            // si le délai aller/retour est atteint pour titre auto porteur en aller/ retour sans liste DV
            Test3502();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param6", buffer35);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        #endregion
    }
}
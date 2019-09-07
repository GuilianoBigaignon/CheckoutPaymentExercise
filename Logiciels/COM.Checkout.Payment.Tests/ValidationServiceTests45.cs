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
    public class ValidationServiceTests45 : ValidationServiceTests
    {
        protected string buffer45 = "4442434954454541454141464542414542414542434642444547475453434A4744494741414141424541524A5252524856434A52525247464141414345524243414341464156494943454141414141414141414141414141414141414141414141434A42494141424146414141464641464249414141414141414141414141414141414141414A565343555747564345525249564744454945474A4257535453574A495256444141555355464141414141414141414141414141414146554745495455525352445345465757484547455349425441425352485647534745464945544A46";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_PVM;
        }

        #region code barre 45 sans liste DV

        [TestMethod]
        public void Test4501()
        {
            // comportement du système en embarquement lors d'une validation en gare de Soudure
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            validationrequest.correlationID = "17";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4502()
        {
            //  refusée pour un  titre auto porteur avec liste DV à une date de validation  >  à la date de Fin de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 08, 01, 02, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4503()
        {
            // refusée pour un  titre auto porteur avec liste DV à une date de validation  <  à la date de Fin de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 06, 30, 01, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4504()
        {
            // refusée pour un titre avec Gare de soudure  si la validation s'effectue dans une gare présente dans le referentiel des gares mais différente de la gare O/D de PSL
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "381624", "IDG_Param1", buffer45);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R14_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4505()
        {
            // débarquement lors d'une validation en gare de Soudure
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 23, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4506()
        {
            // Vérifier que l'antipassback en entrée est ok pour un titre à usage multiple
            Test4501();
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 10, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R12_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4507()
        {
            // Vérifier que l'antipassback en entrée est ok pour un titre à usage multiple
            Test4506();
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 10, 21, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4508()
        {
            // Vérifier que l'antipassback en sortie est ok pour un titre à usage multiple
            Test4501();
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 10, 30, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            validationrequest.correlationID = "20";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4509()
        {
            // Vérifier que l'antipassback en sortie est ok pour un titre à usage multiple
            Test4508();
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 10, 40, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            validationrequest.correlationID = "21";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R12_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4510()
        {
            // Vérifier que l'antipassback en sortie est ok pour un titre à usage multiple
            Test4509();
            DateTime dtDateValidationLocale = new DateTime(2018, 07, 11, 11, 30, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer45);
            validationrequest.correlationID = "22";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        #endregion
    }
}
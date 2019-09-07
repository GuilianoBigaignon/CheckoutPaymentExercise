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
    public class ValidationServiceTests25 : ValidationServiceTests
    {
        protected string buffer25 = "4442434954454541454141464542414542414542434642434747475453434A4744494741414854454541524A5256455245524A52525756454141414145524243414341464947494943414141414141414141414141414141414141414141414141424355454141424146414143444241464249494141414141414141414141414141414147564243465548465547475348564847454347494748575346444757425448524A5745574956484241414141414141414141414141414141414656434348475256534341425643424A4945484646555643564447574747544655534353414845";

        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_PVM;
        }

        #region code barre 25 sans liste DV

        [TestMethod]
        public void Test2501()
        {
            // refusée pour un titre auto porteur sans liste DV à usage unique en cas de validations  consécutives multiple dans un sens.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer25);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test2502()
        {
            // validation en sortie s'effectue avec succès pour titre auto porteur aller simple avec liste DV lorsque le délai aller / retour n'est pas dépassé.
            Test2501();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer25);
            validationrequest.correlationID = "16";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test2503()
        {
            // validation en entrée  s'effectue avec succès pour titre auto porteur aller simple avec liste DV lorsque le délai aller / retour n'est pas dépassé
            Test2502();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer25);
            validationrequest.correlationID = "17";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        [TestMethod]
        public void Test2504()
        {
            //Problème avec is antipassback DEV qui ne prend pas en compte le délai
            // validation en sortie s'effectue en echec pour titre auto porteur aller simple avec liste DV lorsque le délai aller / retour est atteint
            Test2503();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 15, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer25);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        [TestMethod]
        public void Test2505()
        {
            // validation en entrée s'effectue en echec pour titre auto porteur aller simple avec liste DV lorsque le délai aller / retour est atteint
            Test2502();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer25);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        #endregion
    }
}
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
    public class ValidationServiceTests46 : ValidationServiceTests
    {
        protected string buffer46 = "674C4243545945445A52363137343332313633313231313030303030303030303030312F30392F3230313830312F31302F3230313832393039303130313430303338343038332020544553542020202020202020202020202020204241524241524120202020202020202020202032464637302020202020202020202020202020202020202020";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_RR;
        }
        #region code barre 46 sans liste DV

        [TestMethod]
        public void Test4601()
        {
            // titre auto porteur aller/retour avec  liste DV à usage multiple
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 01, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            validationrequest.correlationID = "14";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4602()
        {
            // Vérifier que l'antipassback en entrée est ok pour un titre à usage multiple
            Test4601();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 01, 10, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            validationrequest.correlationID = "15";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.R12_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4603()
        {
            // Vérifier que l'antipassback en entrée est ok pour un titre à usage multiple
            Test4602();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 01, 10, 21, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            validationrequest.correlationID = "16";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4604()
        {
            // Vérifier que l'antipassback en sortie est ok pour un titre à usage multiple
            Test4601();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 30, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            validationrequest.correlationID = "17";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4605()
        {
            // Vérifier que l'antipassback en sortie est ok pour un titre à usage multiple
            // jouer le cas Test 46.04
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 30, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 40, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            validationrequest.correlationID = "25";
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R12_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4606()
        {
            // Vérifier que l'antipassback en sortie est ok pour un titre à usage multiple
            // jouer le cas Test 46.05
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 40, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 30, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);

            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4607()
        {
            //  acceptée pour titre auto porteur à usage multiple  sans  liste DV si la caractéristique Specimen du titre est à non sur un environnement  refusant les Specimens
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 17, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param5", buffer46);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4609()
        {
            // une date de validation < à la date de début de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 08, 31, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4610()
        {
            // Cas de date de validation le lendemain matin de sa date de validité
            // Un titre est accepté entre sa date de début de validité 00:00 et le lendemain de sa date de fin de validité à 02:00 
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 02, 01, 55, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4611()
        {
            // Validation sans passage (1er appel validation, puis appel annulation)
            // Cas de validation sans passage
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 14, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            var antiPassBackService = _scope.Resolve<IAntiPassBackService>();
            antiPassBackService.DeleteAntiPassBack(_connICTER, validationrequest.correlationID);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test4612()
        {
            // suivi d'une validation immédiate avec passage
            Test4611();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 14, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer46);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        #endregion
    }
}
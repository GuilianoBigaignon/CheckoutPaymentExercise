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
    public class ValidationServiceTests52 : ValidationServiceTests
    {
        protected string buffer52 = "3128C04040450000000000174E6CB38F188342A1B0A9B25ADA9AAFE4000007A840058688200000000000000000000000024E000104402580012800000000000000007F4006E9E502B9CAC7680519DC05B952AFBA8E0A00000000000000005E2CA91476A3C3DAFB30881304EB9C529250ABBD";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_DBR;
        }

        #region code barre 52 sans liste DV

        [TestMethod]
        public void Test5201()
        {
            // titre auto porteur aller/retour sans liste DV - entree
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5202()
        {
            // titre auto porteur aller/retour sans liste DV - sortie
            Test5201();
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5203()
        {
            //  délai aller/retour n'est pas atteint
            Test5202();
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5204()
        {
            // délai aller/retour est atteint
            Test5203();
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 15, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            validationrequest.correlationID = "20";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5205()
        {
            // si le délai aller/retour est atteint pour titre auto porteur en aller/ retour sans liste DV
            Test5202();
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5206()
        {
            // caractérisé comme Specimen  sur un environnement  refusant la validation des Specimens
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param5", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R9_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5207TODO()
        {
            // Attente authentification
            // Si Le titre lu n’est pas un titre authentifié sur le système (signature invalide)
            //DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 11, 00, 00, DateTimeKind.Local);
            //ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param5", buffer52);
            //var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //Assert.AreEqual(CodeRetourValue.R9_CB2D.Code, response.resultat);

            ////Remontée d'une activité de validation 
            //Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5208()
        {
            // acceptée pour un titre auto porteur aller/retour sans liste DV si celui-ci n'a jamais été validé en entrée
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5209()
        {
            // refusée pour un  titre auto porteur sans liste DV à une date de validation  < à la date de début de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 09, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5210()
        {
            // refusée pour un  titre auto porteur sans liste DV à une date de validation  >  à la date de Fin de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 17, 02, 30, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5211()
        {
            // validation en entrée s'effectue avec succès pour titre auto porteur sans liste DV peu importe la valeur du paramètre "Paramétarge CB2D Autoporteur accepté ou non en embarquement si absence DV"
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 14, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param2", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5212()
        {
            // refusée pour un titre auto porteur sans liste DV si la validation s'effectue dans une gare différente de la gare O/D
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "381624", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5213()
        {
            // refusée pour un titre auto porteur sans liste DV si la validation s'effectue dans une gare différente de la gare O/D
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "381624", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5214()
        {
            // refusée pour un titre auto porteur sans liste DV à usage unique en cas de validations  consécutives multiple dans un sens.
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            dtDateValidationLocale = new DateTime(2018, 10, 15, 10, 00, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);


            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5215()
        {
            // refusée pour un titre auto porteur sans liste DV à usage unique en cas de validations  consécutives multiple dans un sens.
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            dtDateValidationLocale = new DateTime(2018, 10, 15, 10, 00, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);


            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5216()
        {
            // Un titre est accepté entre sa date de début de validité 00:00 et le lendemain de sa date de fin de validité 02:00 
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 17, 01, 14, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);
            
            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test5217()
        {
            //  validation en entrée puis en sortie sur des dates différentes s'effectue avec succès pour un titre auto porteur aller/ retour sans liste DV
            Test5201();
            DateTime dtDateValidationLocale = new DateTime(2018, 10, 15, 20, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer52);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        #endregion
    }
}
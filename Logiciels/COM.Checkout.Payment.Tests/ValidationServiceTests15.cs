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
    public class ValidationServiceTests15 : ValidationServiceTests
    {
        protected string buffer15 = "4442434954454541454141464542414542414542424546454652475453434A4744494744494841445641524A5256464144524A52525756454141414145524243414341464947494943414141414141414141414141414141414141414141414141424245454141424146414142574A4146424149414141414141414141414141414141414141574545575657444649454949484556565349485457524A474A545542565749434849524948444141414141414141414141414141414148425757454448464342535653554A49455453454754464946544556465449454955485741535457";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_PVM;
        }
        #region code barre 15 sans liste DV

        [TestMethod]
        public void Test1501()
        {
            // Validation en sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1502()
        {
            // Délai aller retour non atteint
            Test1501();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            validationrequest.correlationID = "17";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1503()
        {
            // Délai aller retour pas atteint
            Test1502();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1504()
        {
            // Délai aller retour atteint
            Test1503();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 15, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);


            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1505()
        {
            // Délai aller retour atteint
            Test1502();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            validationrequest.correlationID = "20";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1506()
        {
            //  acceptée pour titre auto porteur sans liste DV s'il a la caractéristique "Specimen" = Non   sur un environnement  refusant la validation des Specimens
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param5", buffer15);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);


            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1507TODO()
        {
            // Attente authentification
            //// Signature incorrect
            //DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 11, 00, 00, DateTimeKind.Local);
            //ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer200);

            //var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //
            //Assert.AreEqual(CodeRetourValue.R11_CB2D.Code, response.resultat);

            ////Remontée d'une activité de validation 
            //Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1508()
        {
            // jamais validé en sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1509()
        {
            //  date de validation  < à la date de début de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1510()
        {
            //  date de validation  >  à la date de Fin de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 19, 02, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1511()
        {
            // "Paramétarge CB2D Autoporteur accepté ou non en debarquement si absence DV" = "Non Accepté"
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer15);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1512()
        {
            //  cas de validations  consécutives multiple en sortie.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1513()
        {
            // paramétrage d'activation des listes DV est à NON
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param6", buffer15);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1514TODO()
        {
            // Attente de l'authentification
            // header invalide en local
            //DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 11, 00, 00, DateTimeKind.Local);
            //ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param6", buffer15);
            //var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //
            //Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            ////Remontée d'une activité de validation 
            //Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1515()
        {
            // Cas de date de validation le lendemain matin de sa date de validité
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 19, 01, 50, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param6", buffer15);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1516()
        {
            // gare de validation n'est pas présente dans le référentiel des gares
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "008", "IDG_Param1", buffer15);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R100_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1517()
        {
            // validation sans passage (1er appel validation, puis appel annulation)
            // Cas de validation sans passage
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            var antiPassBackService = _scope.Resolve<IAntiPassBackService>();
            antiPassBackService.DeleteAntiPassBack(_connICTER, validationrequest.correlationID);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1518()
        {
            // Suivi d'une validation immédiate avec passage
            Test1517();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer15);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        
        #endregion
    }
}
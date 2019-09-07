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
    public class ValidationServiceTests38 : ValidationServiceTests
    {
        protected string buffer38 = "3128C04040450000000000005E6CAAB3A86007A430A9AAFE429AE503800007A8400586882000000000000000000000000114424104801F80011800000000000000005C78B4EB15BE7F722AA3AAE5C213894103A5779800000000000000006357E8B8D8A69A5A55013C53B632AC4DFF6DB1D3";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_NOVATER;
        }

        #region code barre 38 sans liste DV

        [TestMethod]
        public void Test3801()
        {
            // aller simple sans LDV - entrée
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3802()
        {
            Test3801();
            // aller simple sans LDV - sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3803()
        {
            // aller simple quand délai aller/retour pas atteint
            Test3802();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            validationrequest.correlationID = "20";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        [TestMethod]
        public void Test3804()
        {
            // refus aller simple quand délai aller/retour atteint
            Test3803();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 15, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            validationrequest.correlationID = "21";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);


            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        [TestMethod]
        public void Test3805()
        {
            // refus aller simple quand délai aller/retour atteint
            Test3802();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            validationrequest.correlationID = "21";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        [TestMethod]
        public void Test3806()
        {
            // refus quand caractérisé comme "Specimen"  sur un environnement  refusant la validation des Specimens
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param5", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R9_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3807TODO()
        {
            //Manque l'authentification
            ////Le titre lu n’est pas un titre authentifié sur le système(signature invalide)
            //DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 11, 00, 00, DateTimeKind.Local);
            //ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer200);

            //var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //
            //Assert.AreEqual(CodeRetourValue.R11_CB2D.Code, response.resultat);

            ////Remontée d'une activité de validation 
            //Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3808()
        {
            // titre jamais validé en entrée
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3809()
        {
            // date validation > date fin de validité
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 09, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3810()
        {
            // date validation > date fin de validité
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 17, 02, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3811()
        {
            // valeur du paramètre "Paramétarge CB2D Autoporteur accepté ou non en embarquement si absence DV" = "Non Accepté"
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param2", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        [TestMethod]
        public void Test3812()
        {
            // Changement de gare => pas dans la gare O/D - entrée
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "381624", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3813()
        {
            // Changement de gare => pas dans la gare O/D - sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "381624", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3814()
        {
            // cas de validations consécutives multiple en entrée.            
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 11, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            dtDateValidationLocale = new DateTime(2018, 09, 11, 10, 30, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3815()
        {
            // cas de validations consécutives multiple en entrée.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param6", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3816TODO()
        {
            // manque l'authentification
            //    // authentification header pas bonne 
            //DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 11, 00, 00, DateTimeKind.Local);
            //    ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", "");

            //    var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //    
            //    Assert.AreEqual(CodeRetourValue.R10_CB2D.Code, response.resultat);

            //    //Remontée d'une activité de validation 
            //    Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3817()
        {
            // cas de validations consécutives multiple en entrée.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer202);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R17_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3818()
        {
            // cas de validations consécutives multiple en entrée.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer202);

            var resolverCache = _scope.Resolve<ICacheServices>();
            resolverCache.DeleteTitre("NOVOD");
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            resolverCache.InsertTitreNOVOD();

            
            Assert.AreEqual(CodeRetourValue.R17_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);

        }

        [TestMethod]
        public void Test3819()
        {
            // cas de validations consécutives multiple en entrée.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer202);
            var resolverCache = _scope.Resolve<ICacheServices>();

            resolverCache.DeleteTarif("PT");
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            resolverCache.InsertTarifPT();

            
            Assert.AreEqual(CodeRetourValue.R17_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3820()
        {
            //Cas de date de validation le lendemain matin de sa date de validité
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 17, 01, 50, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3821()
        {
            // cas de gare non présent dans le référentiel
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "4008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            
            Assert.AreEqual(CodeRetourValue.R100_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3822()
        {
            // validation sans passage (1er appel validation, puis appel annulation)
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            
            var antiPassBackService = _scope.Resolve<IAntiPassBackService>();
            antiPassBackService.DeleteAntiPassBack(_connICTER, validationrequest.correlationID);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test3823()
        {
            // Validation sans passage 
            // Suivi d'une validation immédiate avec passage
            Test3822();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer38);

            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);


            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        #endregion
    }
}
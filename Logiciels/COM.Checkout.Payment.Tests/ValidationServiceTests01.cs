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
    public class ValidationServiceTests01 : ValidationServiceTests
    {
        protected string bufferfake = "gfgd";
        protected string buffer1 = "32323030B0C10FB67136B12E50D00179CDB63CA9ABDC1F745A1750D7BDB226E9EC6050A329474524ADC4A1B93269E99054A3E9A767BFA1BA91B6A601031BA3F4BC48126D6B9AA11A95D42F5048E37B00E161E55D0C8F8FDFC0AC636706839107155DFEBDFFBC5E93AB3484DC2B0C3B159226E524801B49C8C6B6B8A5E114C726C3BA4B8B199050058957E7E18E2FDA4429A579AF502BF2C325763CD34A1DD66265200266203F6C61914CDDD1B669B2A4D0D4B0FD17B5BCE97741F8C5416E786022D617A1AAE1418E7C7A3DC70F2761113734E2398AAFA7FF9C1ED60D9967C354BB15DA3AD8BBA6916503B9A1C58C0B91019D79B1DADD32E022FCAAA0B5687E14F73A18AA3130543130303837303030303039343235465250534C46525351592020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202053313330393230313832505430304452442050543030205441524946204E4F524D4154455354202020202020202020202020202020554E202020202020202020202020202020202030313031313939304144554C5445202020203031202020202020202020203030313330393230313830313031323035303030303030303030303030303132303732303138313134373030303030303236303020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_SECUTIX;
        }

        #region code barre 1 sans liste DV

        [TestMethod]
        public void Test0101()
        {
            // Validation en entrée s'effectue avec succès pour un titre auto porteur aller simple sans liste DV
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0102()
        {
            // Validation en sortie s'effectue avec succès pour titre auto porteur aller simple sans liste DV lorsque le délai aller / retour n'est pas atteint
            Test0101();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            validationrequest.correlationID = "17";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0103()
        {
            // validation en entrée s'effectue avec succès pour titre auto porteur aller simple sans liste DV lorsque le délai aller / retour n'est pas atteint
            Test0102();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0104()
        {
            //  Validation en sortie s'effectue avec succès pour titre auto porteur aller simple sans liste DV lorsque le délai aller / retour n'est pas atteint
            Test0103();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 15, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0105()
        {
            // validation en entrée s'effectue en echec pour titre auto porteur aller simple sans liste DV lorsque le délai aller / retour est atteint
            Test0102();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            validationrequest.correlationID = "21";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0106()
        {
            //  validation en entrée ou en sortie est refusée pour titre auto porteur sans liste DV s'il est caractérisé comme "Specimen"  sur un environnement  refusant la validation des Specimens
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param5", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R9_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0107TODO()
        {
            // Attente de l'authentification
            //  validation en entrée ou en sortie est refusée pour titre auto porteur sans liste DV s'il est caractérisé comme "Specimen"  sur un environnement  refusant la validation des Specimens
            //DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 11, 00, 00, DateTimeKind.Local);
            //ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            //var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //Assert.AreEqual(CodeRetourValue.R9_CB2D.Code, response.resultat);

            ////Remontée d'une activité de validation 
            //Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0108()
        {
            // validation en sortie est acceptée  pour un titre auto porteur allé simple sans liste DV si celui-ci n'a jamais été validé en entrée
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0109()
        {
            // date de validation  < à la date de début de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0110()
        {
            // date de validation > à la date de Fin de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2051, 09, 14, 02, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0111()
        {
            // si la valeur du paramètre "Paramétarge CB2D Autoporteur accepté ou non en embarquement si absence DV" = "Non Accepté"
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param2", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0112()
        {
            // validation s'effectue dans une gare présente dans le référentiel mais différente de la gare O/D
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 12, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "381624", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0113()
        {
            // s'effectue dans une gare présente dans le referentiel des gares mais différente de la gare O/D
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "381624", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0114()
        {
            // usage unique en cas de validations  consécutives multiple en entrée.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 30, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0115()
        {
            // validé avec succès si le paramétrage d'activation des listes DV est à NON
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param6", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0116TODO()
        {
            // Attente Authentification
            //  refusée pour un titre auto porteur si le titre lu n’est pas un titre authentifié sur le système (header invalide en local)
            //DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 11, 00, 00, DateTimeKind.Local);
            //ValidationRequestDTO validationrequest = ValidationRequestUpdate(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            //var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            //Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            ////Remontée d'une activité de validation 
            //Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0117()
        {
            // Refusée pour un titre auto porteur si une erreur de décodage du code barre (structure code barre invalide) est identifiée.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", bufferfake);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R17_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0118()
        {
            // refusée pour un titre auto porteur si le code titre n'a pas été définie dans le système
            var resolverCache = _scope.Resolve<ICacheServices>();
            resolverCache.DeleteTitre("T1");
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            resolverCache.InsertTitreT1();

            Assert.AreEqual(CodeRetourValue.R15_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0119()
        {
            // refusée pour un titre auto porteur si le code tarif n'a pas été définie dans le système
            var resolverCache = _scope.Resolve<ICacheServices>();
            resolverCache.DeleteTarif("PT");
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 13, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            resolverCache.InsertTarifPT();

            Assert.AreEqual(CodeRetourValue.R16_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0120()
        {
            // accepté entre sa date de début de validité 00:00 et le lendemain de sa date de fin de validité 02:00 
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 01, 50, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0121()
        {
            //  refusée si la gare de validation n'est pas présente dans le référentiel des gares   
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "88008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R100_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0122()
        {
            // validation sans passage (1er appel validation, puis appel annulation)
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            var antiPassBackService = _scope.Resolve<IAntiPassBackService>();
            antiPassBackService.DeleteAntiPassBack(_connICTER, validationrequest.correlationID);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test0123()
        {
            // validation sans passage 
            Test0122();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer1);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        #endregion
    }
}
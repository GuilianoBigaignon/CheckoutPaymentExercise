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
    public class ValidationServiceTests10 : ValidationServiceTests
    {
        protected string buffer10 = "65454456545849414249363137333335323436313131313030303030303030303020203031303038313835323534323630465241434B465250534C303333313020313939363235343030343031353146413032412020202020202020202020202020202020202020202020202020202020202A202020202020";
        protected string buffer38 = "3128C04040450000000000005E6CAAB3A86007A430A9AAFE429AE503800007A8400586882000000000000000000000000114424104801F80011800000000000000005C78B4EB15BE7F722AA3AAE5C213894103A5779800000000000000006357E8B8D8A69A5A55013C53B632AC4DFF6DB1D3";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_RR;
        }

        [TestInitialize]
        public void InitListeDV10()
        {
            InsertData("LDV_CODE_BARRE_10", _connICTER);
        }

        #region code barre 10 avec liste DV

        [TestMethod]
        public void Test1001()
        {
            // Vérifier que la validation en sortie s'effectue avec succès pour un titre auto porteur aller simple(PSL destination) avec liste DV
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            validationrequest.correlationID = "17";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
            //Remontée d'une activité de compostage
            Assert.AreEqual(true, response.compostage != null);
        }

        [TestMethod]
        public void Test1002()
        {
            // succès pour titre auto porteur aller simple(PSL destination) avec liste DV lorsque le délai aller / retour n'est pas dépassé.
            Test1001();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            validationrequest.correlationID = "18";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
            //Remontée d'une activité de compostage
            Assert.AreEqual(true, response.compostage != null);
        }

        [TestMethod]
        public void Test1003()
        {
            //   succès pour titre auto porteur aller simple(PSL destination) avec liste DV lorsque le délai aller / retour n'est pas dépassé
            Test1002();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 11, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            validationrequest.correlationID = "19";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
            //Remontée d'une activité de compostage
            Assert.AreEqual(true, response.compostage != null);
        }

        [TestMethod]
        public void Test1004TODO()
        {
            // résultat ok en première version
            // echec pour titre auto porteur aller simple(PSL destination) avec liste DV lorsque le délai aller / retour est atteint
            Test1003();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 15, 15, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            validationrequest.correlationID = "20";
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);
            //Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
            //Remontée d'une activité de compostage
            Assert.AreEqual(true, response.compostage != null);
        }

        [TestMethod]
        public void Test1005TODO()
        {
            // résultat ok en première version
            // echec pour titre auto porteur aller simple(PSL destination) avec liste DV lorsque le délai aller / retour est atteint
            Test1002();
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 15, 20, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);
            //Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
            //Remontée d'une activité de compostage
            Assert.AreEqual(true, response.compostage != null);
        }

        [TestMethod]
        public void Test1006()
        {
            // refusée pour titre auto porteur avec  liste DV s'il est caractérisé comme Specimen  sur un environnement refusant les Specimens
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 17, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param5", buffer38);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R9_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1007()
        {
            // refusé pour un titre auto porteur aller  simple(PSL destination) avec liste DV si celui-ci n'a jamais été validé en sortie
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 16, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
            //Remontée d'une activité de compostage
            Assert.AreEqual(true, response.compostage != null);
        }

        [TestMethod]
        public void Test1008()
        {
            // refusée pour un  titre auto porteur avec liste DV à une date de validation  < à la date de début de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 10, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1009()
        {
            // refusée pour un  titre auto porteur avec liste DV à une date de validation  >  à la date de Fin de validité du titre
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 19, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R4_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1010()
        {
            //  succès pour un titre auto porteur avec  liste DV si la  valeur du paramètre 
            // "Paramétarge CB2D Autoporteur accepté ou non en embarquement si absence DV" est a "Non accepté" et le titre est bien présent  en liste DV
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1011()
        {
            // refusée pour un titre auto porteur avec  liste DV si la  valeur du paramètre "Paramétarge CB2D Autoporteur accepté ou non en embarquement si absence DV" est a "Non accepté" et le titre n'est pas présent en liste DV
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 10, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_CODE_BARRE_10_Update_tcn_incorrect", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_tcn_correct", _connICTER);

            Assert.AreEqual(CodeRetourValue.R18_CB2D.Code, response.resultat);
            

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1012()
        {
            // acceptée pour un titre auto porteur avec  liste DV si la  valeur du paramètre "Paramétarge CB2D Autoporteur accepté ou non en débarquement si absence DV" est a " accepté" et le titre n'est pas présent en liste DV
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_CODE_BARRE_10_Update_tcn_incorrect", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_tcn_correct", _connICTER);

            Assert.AreEqual(CodeRetourValue.A1_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1013()
        {
            // refusée pour un titre auto porteur avec liste DV si la validation s'effectue dans une gare différente de la gare O/D
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "381624", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1014()
        {
            //  refusée pour un titre auto porteur avec liste DV si la validation s'effectue dans une gare différente de la gare O/D
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 12, 10, 30, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "381624", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.R7_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1015()
        {
            // refusée pour un titre auto porteur avec liste DV à usage unique en cas de validations  consécutives multiple en sortie.
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 16, 10, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            dtDateValidationLocale = new DateTime(2018, 09, 16, 10, 30, 00, DateTimeKind.Local);
            validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            Assert.AreEqual(CodeRetourValue.R13_CB2D.Code, response.resultat);


            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1016()
        {
            // succès pour un titre auto porteur aller simple avec  liste DV si le paramètre d'activation liste DV est à non 
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 13, 10, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_PARAMETRAGE_Update_0", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_PARAMETRAGE_Update_1", _connICTER);
            Assert.AreEqual(CodeRetourValue.A3_CB2D.Code, response.resultat);
            
            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }

        [TestMethod]
        public void Test1017()
        {
            // succès pour un titre auto porteur aller simple avec  liste DV si le paramètre d'activation liste DV est à non 
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 11, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_CODE_BARRE_10_Update_status_refund", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_status_active", _connICTER);

            Assert.AreEqual(CodeRetourValue.R3_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1018()
        {
            // acceptée pour un titre auto porteur avec liste DV à usage unique si le titre à fait l'object d'une Annulation 
            // et la valeur du paramètre "CB2D Autoporteur accepté ou non en débarquement si absence DV" est a "accepté"
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 11, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_CODE_BARRE_10_Update_status_canceled", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_status_active", _connICTER);

            Assert.AreEqual(CodeRetourValue.R3_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1019()
        {
            // refusée pour un titre auto porteur avec liste DV à usage unique si le titre à fait l'objet d'un rembourssement 
            // et la valeur du paramètre "CB2D Autoporteur accepté ou non en débarquement si absence DV" est a "Non accepté"
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 11, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_CODE_BARRE_10_Update_status_refund", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_status_active", _connICTER);

            Assert.AreEqual(CodeRetourValue.R3_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1020()
        {
            // refusée pour un titre auto porteur avec liste DV à usage unique si le titre à fait l'objet d'une Annulation 
            // et la valeur du paramètre "CB2D Autoporteur accepté ou non en débarquement si absence DV" est a "Non accepté"
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 11, 00, 00, DateTimeKind.Local);
            UpdateData("LDV_CODE_BARRE_10_Update_status_canceled", _connICTER);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_status_active", _connICTER);

            Assert.AreEqual(CodeRetourValue.R3_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1021()
        {
            // accepté entre sa date de début de validité 00:00 et le lendemain de sa date de fin de validité à 02:00 
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 18, 01, 50, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1025TODO()
        {
            // refusée en sortie(débarquement) pour un titre auto porteur comportant un seul  segment et ce segment est déjà composté au moment de la validation
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 14, 14, 10, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer10);
            
            UpdateData("LDV_CODE_BARRE_10_Update_ticket_gare_incorrect", _connICTER);
            UpdateData("LDV_CODE_BARRE_10_Update_ticket_stamped", _connICTER);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_ticket_gare_correct", _connICTER);
            UpdateData("LDV_CODE_BARRE_10_Update_ticket_pending", _connICTER);
            //Assert.AreEqual(CodeRetourValue.R19_CB2D.Code, response.resultat);
            Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1030()
        {
            // refusée pour un titre auto porteur avec liste DV à usage unique si le titre a fait l'object d'un échange 
            // et la paramètre "Paramétarge CB2D Autoporteur accepté ou non en débarquement si absence DV" est a "Non accepté"
            UpdateData("LDV_CODE_BARRE_10_Update_status_exchanged", _connICTER);
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_status_active", _connICTER);

            Assert.AreEqual(CodeRetourValue.R3_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }
        [TestMethod]
        public void Test1031()
        {
            //  refusée pour un titre auto porteur avec liste DV à usage unique si le titre a le statut "Après vente" et la paramètre 
            // "Paramétarge CB2D Autoporteur accepté ou non en débarquement si absence DV" est a "Non accepté"
            UpdateData("LDV_CODE_BARRE_10_Update_status_aftersale", _connICTER);
            DateTime dtDateValidationLocale = new DateTime(2018, 09, 15, 11, 00, 00, DateTimeKind.Local);
            ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param2", buffer10);
            var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);
            UpdateData("LDV_CODE_BARRE_10_Update_status_active", _connICTER);

            Assert.AreEqual(CodeRetourValue.R3_CB2D.Code, response.resultat);

            //Remontée d'une activité de validation 
            Assert.AreEqual(true, response.validation != null);
        }


        #endregion
    }
}
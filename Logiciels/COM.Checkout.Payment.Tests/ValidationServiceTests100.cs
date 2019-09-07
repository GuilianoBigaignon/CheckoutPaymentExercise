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
    public class ValidationServiceTests100 : ValidationServiceTests
    {
        protected string buffer100 = "69304356514C554D414E3632313936303830323132313132332F30322F31393635465250534C4652564C41303632313731372F3039303032393039303136373330303731323334352020202020202020202020202020544F544F532020202020202020202046414954445556454C314641303030202020202020202020203030303030";
        protected override TypeCanalEnum GetTypeCanal()
        {
            return Api.Service.TypeCanalEnum.Canal_EBillet;
        }

        [TestInitialize]
        public void InitListeDV100()
        {
            InsertData("LDV_CODE_BARRE_100", _connICTER);
        }

        #region code barre 100 avec liste DV

        //[TestMethod]
        //public void Test10001()
        //{
        //    // titre auto porteur aller/retour sans liste DV - entree
        //    DateTime dtDateValidationLocale = new DateTime(2018, 09, 17, 10, 00, 00, DateTimeKind.Local);
        //    ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.ENTREE, dtDateValidationLocale, "384008", "IDG_Param1", buffer100);
        //    var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

        //    Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

        //    //Remontée d'une activité de validation 
        //    Assert.AreEqual(true, response.validation != null);
        //}

        //[TestMethod]
        //public void Test10002()
        //{
        //    Test10001();
        //    // titre auto porteur aller/retour sans liste DV - sortie
        //    DateTime dtDateValidationLocale = new DateTime(2018, 09, 17, 11, 00, 00, DateTimeKind.Local);
        //    ValidationRequestDTO validationrequest = ValidationRequestInit(SensPassage.SORTIE, dtDateValidationLocale, "384008", "IDG_Param1", buffer100);
        //    var response = _resolverValidationService.ValidationRequest(_connICTER, validationrequest);

        //    Assert.AreEqual(CodeRetourValue.A0_CB2D.Code, response.resultat);

        //    //Remontée d'une activité de validation 
        //    Assert.AreEqual(true, response.validation != null);
        //}
        


        #endregion
    }
}
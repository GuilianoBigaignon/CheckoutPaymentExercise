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
    public abstract class ValidationServiceTests : AbstractBaseICTERTest
    {
        protected string buffer35 = "6545445654584A565147363137333339373431313131313030303030303030303020203032303238313835202020202020465241434B465250534C303333303220313239373235343030343032333150473034414820202020202020202020202020202020202020202020202020202020202A202020202020";
        protected string buffer200 = "3128C04040450000000000005E6CAAB3A86007A430A9AAFE429AE503800007A8400586882000000000000000000000000114424104801F80011800000000000000005C78B4EB15BE7F722AA3AAE5C213894103A5779800000000000000006357E8B8D8A69A5A55013C53B632AC4DFF6DB1D3";
        protected string buffer201 = "3128C04040450000000000005E6CAAB3A86007A430A9AAFE429AE503800007A8400586882000000000000000000000000114424104801F80011800000000000000005C78B4EB15BE7F722AA3AAE5C213894103A5779800000000000000006357E8B8D8A69A5A55013C53B632AC4DFF6DB1D3";
        protected string buffer202 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        protected static ILifetimeScope _scope;
        protected static IValidationServices _resolverValidationService;

        #region init & clean test

        [TestInitialize]
        public void Init()
        {
            _scope = _container.BeginLifetimeScope();
            _resolverValidationService = _scope.Resolve<IValidationServices>();
            var resolverCache = _scope.Resolve<ICacheServices>();
            InitDb();
            resolverCache.SetCache();
        }


        public ValidationServiceTests() : base()
        {
        }

        [TestCleanup]
        public void CleanDb()
        {
            _scope.Dispose();
            ResetDatabase(); //RAZ des données de la BDD
        }

        public void InitDb()
        {
            InsertData("PAR_JEU_PARAMETRE_TestFinal", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT_TestFinal", _conn);
            InsertData("PAR_ICTPGEN_TestFinal", _conn);
            InsertData("PAR_TITRE_TestFinal", _conn);
            InsertData("PAR_TITRE_CAR_TestFinal", _conn);
            InsertData("PAR_TARIF_TestFinal", _conn);
            InsertData("PAR_TARIF_CAR_TestFinal", _conn);
            InsertData("ADM_GARE_TestFinal", _conn);
            InsertData("ADM_GARE_ICTER_TestFinal", _conn);
            InsertData("PAR_GARE_LIEE_TestFinal", _conn);
            InsertData("PAR_CONFIGURATION_TestFinal", _conn);
            InsertData("PAR_ASS_CONF_PARAM_TestFinal", _conn);
            InsertData("LDV_PARAMETRAGE", _connICTER);
        }
        #endregion

        #region gestion object en entrée

        protected abstract TypeCanalEnum GetTypeCanal();

        private ValidationRequestDTO ValidationRequestInit()
        {
            return new ValidationRequestDTO()
            {
                dateHeureNotification = string.Empty,
                typeTraitement = TypeTraitement.Validation,
                equipmentID = string.Empty,
                numeroCalife = string.Empty,
                empreinte = "PSL",
                correlationID = "correlationID",
                typeCanal = ((int)GetTypeCanal()).ToString(),
                typeMapping = TypeMappingEnum.Secutix.ToString()
            };
        }

        /// <summary>
        /// Méthode d'initialisation de l'objet en entrée de ICTER.Online
        /// </summary>
        /// <param name="sens"></param>
        /// <param name="dateHeureValidationLocale">chaine de caractère contenant la date de la validation en heure locale</param>
        /// <param name="codeGareUIC"></param>
        /// <param name="groupId"></param>
        /// <param name="buffer"></param>
        /// <returns></returns>
        public ValidationRequestDTO ValidationRequestInit(string sens, DateTime dateHeureValidationLocale, string codeGareUIC, string groupId, string buffer)
        {
            string formatDate = "yyyy-MM-ddTHH:mm:ss.ffZ";
            // date de la validation envoyée par le CAB en heure GMT
            DateTime dtDateValidationUtc = dateHeureValidationLocale.ToUniversalTime();
            string dateHeureValidationUtc = dtDateValidationUtc.ToString(formatDate);

            ValidationRequestDTO validationrequest = ValidationRequestInit();
            validationrequest.sensPassage = sens;
            validationrequest.dateHeureValidation = dateHeureValidationUtc;
            validationrequest.gareCodeUIC = codeGareUIC;
            validationrequest.groupID = groupId;
            validationrequest.buffer = buffer;
            return validationrequest;
        }

        #endregion
    }
}
using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;
using ICTER.Online.Api.ParseurCb2dSncfService.Domain;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class OrigineDestinationGareLieeTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public OrigineDestinationGareLieeTests() : base()
        {
        }

        [TestCleanup]
        public void CleanDb()
        {
            ResetDatabase(); //RAZ des données de la BDD
        }

        public void InitDb()
        {
            InsertData();
        }

        private void InsertData()
        {

            InsertData("PAR_JEU_PARAMETRE_OrigineDestination", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            InsertData("PAR_CONFIGURATION", _conn);
            InsertData("PAR_ASS_CONF_PARAM_OrigineDestination", _conn);
            InsertData("ADM_GARE_OrigineDestination", _conn);

            InsertData("ADM_GARE_ICTER_OrigineDestination", _conn);

            InsertData("PAR_GARE_LIEE_OrigineDestination", _conn);

        }

        [TestMethod]
        public void Test_PS01_02_R23()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverOrigineDestination = scope.Resolve<IOrigineDestinationGareLieeService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                resolverCache.SetCache();

                var CB2DValid = new CB2DGenerique();
                var CB2DinValid = new CB2DGenerique();
                var CB2DsegmentVide = new CB2DGenerique();

                CB2DValid.Segment1 = new CB2DSegment();
                CB2DValid.Segment2 = new CB2DSegment();
                CB2DValid.Segment1.Destination = "RRCod";
                CB2DValid.Segment1.Via = "CodRR";
                CB2DValid.Segment2.Destination = "CodRR";
                CB2DValid.Segment2.Origine = "CodRR";
                CB2DValid.Segment1.Origine = "CodRR";

                CB2DinValid.Segment1 = new CB2DSegment();
                CB2DinValid.Segment2 = new CB2DSegment();

                //CodeRR Vide
                Assert.AreEqual(CodeRetourValue.R100_CB2D, resolverOrigineDestination.CheckOriginDestinationGareLiees(456789, CB2DValid, resolverCache.GetCacheParamByGroupId("TestExist")));
                //SegmentsVide
                Assert.AreEqual(CodeRetourValue.R14_CB2D, resolverOrigineDestination.CheckOriginDestinationGareLiees(654321, CB2DsegmentVide, resolverCache.GetCacheParamByGroupId("TestExist")));
                //SegmentsInvalide
                Assert.AreEqual(CodeRetourValue.R14_CB2D, resolverOrigineDestination.CheckOriginDestinationGareLiees(123456, CB2DinValid, resolverCache.GetCacheParamByGroupId("TestExist")));
                //OK
                Assert.AreEqual(null, resolverOrigineDestination.CheckOriginDestinationGareLiees(654321, CB2DValid, resolverCache.GetCacheParamByGroupId("TestExist")));

            }

        }
    }
}

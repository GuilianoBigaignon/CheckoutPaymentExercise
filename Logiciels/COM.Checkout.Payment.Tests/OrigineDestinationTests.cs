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
    public class OrigineDestinationTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public OrigineDestinationTests() : base()
        {
        }

        [TestCleanup]
        public void CleanDb()
        {
            ResetDatabase(); //RAZ des données de la BDD
        }

        public void InitDb()
        {
            InsertData("PAR_JEU_PARAMETRE_OrigineDestination", _conn);
            InsertData("PAR_GROUPE_EQUIPEMENT", _conn);
            InsertData("PAR_CONFIGURATION", _conn);
            InsertData("PAR_ASS_CONF_PARAM_OrigineDestination", _conn);
            InsertData("ADM_GARE_OrigineDestination", _conn);

            InsertData("ADM_GARE_ICTER_OrigineDestination", _conn);

            InsertData("PAR_GARE_LIEE_OrigineDestination", _conn);
            
        }

        private void InsertData()
        {
        }

        [TestMethod]
        public void Test_PS01_02_R16()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var resolverOrigineDestination = scope.Resolve<IOrigineDestinationService>();
                var resolverCache = scope.Resolve<ICacheServices>();
                var CB2DValid = new CB2DGenerique();
                var CB2DinValid = new CB2DGenerique();
                var CB2DsegmentVide = new CB2DGenerique();

                CB2DValid.Segment1 = new CB2DSegment();
                CB2DValid.Segment2 = new CB2DSegment();
                CB2DValid.Segment1.Destination = "CodRR";
                CB2DValid.Segment1.Via = "CodRR";
                CB2DValid.Segment2.Destination = "CodRR";
                CB2DValid.Segment2.Origine = "CodRR";
                CB2DValid.Segment1.Origine = "CodRR";
                CB2DinValid.Segment1 = new CB2DSegment();
                CB2DinValid.Segment2 = new CB2DSegment();

                resolverCache.SetCache();
                

                Assert.AreEqual(CodeRetourValue.R7_CB2D, resolverOrigineDestination.CheckOriginDestination(123456, CB2DinValid));
                Assert.AreEqual(CodeRetourValue.R100_CB2D, resolverOrigineDestination.CheckOriginDestination(0, CB2DinValid));
                Assert.AreEqual(CodeRetourValue.R100_CB2D, resolverOrigineDestination.CheckOriginDestination(0, CB2DValid));
                Assert.AreEqual(null, resolverOrigineDestination.CheckOriginDestination(123456, CB2DValid));

                Assert.AreEqual(CodeRetourValue.R7_CB2D, resolverOrigineDestination.CheckOriginDestination(123456, CB2DsegmentVide));
                Assert.AreEqual(CodeRetourValue.R100_CB2D, resolverOrigineDestination.CheckOriginDestination(0, CB2DsegmentVide));

            }

        }
    }
}

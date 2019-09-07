using Microsoft.VisualStudio.TestTools.UnitTesting;
using ICTER.Online.Api.Service;
using Autofac;
using Framework.Database;
using System.Configuration;
using Framework.Database.Testing;
using ICTER.Online.Api.Contract;
using ICTER.Online.Api.ParseurCb2dSncfService.Domain;
using ICTER.Online.Entity;
using System;
using System.Reflection;
using System.Collections;

namespace ICTER.Online.Tests
{
    [TestClass]
    public class PostValidationCompostageTests : AbstractBaseICTERTest
    {
        [TestInitialize]
        public void InitCodeTitreStub()
        {
            InitDb();
        }

        public PostValidationCompostageTests() : base()
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

        }

        [TestMethod]
        public void Test_PS01_04_R02()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                var PostValidationCompostage = scope.Resolve<ICompostageService>();

                var cb2d = new CB2DGenerique()
                {
                    Segment1 = new CB2DSegment
                    {
                        DateTrain = DateTime.Now,
                        Train = 10,
                    },
                    RefDossier = "10",
                    TCN = "TCN"
                };


                var ticket = new TicketValidationEntity();

                var resp = new ValidationResponseDTO();

                var req1 = new ValidationRequestDTO()
                {
                    typeTraitement = TypeTraitement.Rejeu,
                    correlationID = "10",
                    numeroCalife = "10",
                    dateHeureValidation = "10/10/10",
                    sensPassage = SensPassage.ENTREE
                };



                var req2 = new ValidationRequestDTO();
                req2.typeTraitement = TypeTraitement.Validation;

                var compostage1 = PostValidationCompostage.Compostage(req1, resp, cb2d, ticket);
                var compostage2 = PostValidationCompostage.Compostage(req1, resp, cb2d, ticket);
                var compostage3 = PostValidationCompostage.Compostage(req1, resp, cb2d, null);

                var compostageAttendu1et2 = new Compostage()
                {
                    carrierMode = ticket.carrierMode,
                    correlationIdVal = req1.correlationID,
                    courseId = ticket.courseId,
                    departureTimeMarked = ticket.departureTimeMarked,
                    departureTimeOriginal = ticket.departureTimeOriginal,
                    markDeviceId = ticket.markDeviceId,
                    markDeviceType = ticket.markDeviceType,
                    markIUCList = ticket.markIUCList,
                    markMode = MarkMode.DV,
                    markStation = ticket.markStation,
                    orderId = ticket.orderId,
                    pnr = ticket.pnr,
                    tcn = ticket.tcn,
                    ticketMarkDateTime = ticket.ticketMarkDateTime,
                    ticketMarkType = ticket.ticketMarkType,
                    trainNumberMarked = ticket.trainNumberMarked,
                    trainNumberOriginal = ticket.trainNumberOriginal
                };

                var compostageAttendu3 = new Compostage
                {
                    carrierMode = null,
                    correlationIdVal = req1.correlationID,
                    courseId = null,
                    departureTimeMarked = cb2d.Segment1?.DateTrain?.ToString(),
                    departureTimeOriginal = cb2d.Segment1?.DateTrain?.ToString(),
                    markDeviceId = req1.numeroCalife,
                    markDeviceType = "CAB",
                    markIUCList = null,
                    markMode = null,
                    markStation = null,
                    orderId = null,
                    pnr = cb2d.RefDossier,
                    tcn = cb2d.TCN,
                    ticketMarkDateTime = req1.dateHeureValidation,
                    ticketMarkType = req1.sensPassage == SensPassage.ENTREE ? MarkTypeEnum.STAMPED : MarkTypeEnum.NONE,
                    trainNumberMarked = cb2d.Segment1?.Train?.ToString(),
                    trainNumberOriginal = cb2d.Segment1?.Train?.ToString()

                };

                Assert.AreEqual(MarkMode.DV, compostage1.markMode);
                Assert.AreEqual(MarkMode.DV, compostage2.markMode);
                PropertyValuesAreEquals(compostageAttendu3, compostage3);
                PropertyValuesAreEquals(compostageAttendu1et2, compostage1);
                PropertyValuesAreEquals(compostageAttendu1et2, compostage2);
            }
        }


        private static void PropertyValuesAreEquals(object actual, object expected)
        {
            PropertyInfo[] properties = expected.GetType().GetProperties();
            foreach (PropertyInfo property in properties)
            {
                object expectedValue = property.GetValue(expected, null);
                object actualValue = property.GetValue(actual, null);
                if (!Equals(expectedValue, actualValue))
                    Assert.Fail("");
            }
        }
    }
}
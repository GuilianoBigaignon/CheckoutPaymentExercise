using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Reflection;

namespace Com.Checkout.Tests
{
    [TestClass]
    public class PostValidationCompostageTests : AbstractBaseTest
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
        public void Test_PS00_00_R00()
        {
            using (var scope = _container.BeginLifetimeScope())
            {
                //Add test logic

                //Add validation
                //Assert.AreEqual(VAL1, VAL2);
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
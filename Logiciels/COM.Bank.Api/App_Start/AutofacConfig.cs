using System.Configuration;
using System.Reflection;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using Framework.Database;
using COM.Checkout.Payment.Api.Service.Impl;

namespace COM.Bank.Api
{
    /// <summary>
    /// 
    /// </summary>
    public static class AutofacConfig
    {
        /// <summary>
        /// 
        /// </summary>
        public static void ConfigureContainer()
        {
            Register(GlobalConfiguration.Configuration);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="config"></param>
        /// <returns></returns>
        public static IContainer Register(HttpConfiguration config)
        {
            // IoC AutoFac configuration
            // =========================
            var builder = new ContainerBuilder();

            // Register db context factory
            //ConnectionStringSettings connSettings = ConfigurationManager.ConnectionStrings["DBServices"];
            //builder.RegisterInstance(DbContextFactoryBuilder.Build(connSettings)).As<IDbContextFactory>();
            //builder.RegisterInstance(DbContextFactoryBuilder.Build(connSettings).CreateContext()).As<IDbContext>();

            #region Setup a common pattern

            // Register all existing types

            // Reference Dll for Autofac
         
            builder.RegisterAssemblyTypes(typeof(PaymentServices).Assembly)
           .AsImplementedInterfaces()
           .InstancePerRequest();

            // Register all controllers at once
            builder.RegisterApiControllers(Assembly.GetAssembly(typeof(AutofacConfig)));

            //builder.RegisterType<LoggerService>().SingleInstance().AsSelf();
            #endregion Setup a common pattern

            #region Register all controllers for the assembly

            // Register AutoFac filter provider
            builder.RegisterWebApiFilterProvider(config);

            #endregion

            // Set the MVC dependency resolver to use Autofac
            var container = builder.Build();
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);

            return container;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="config"></param>
        /// <param name="testContext"></param>
        /// <returns></returns>
        public static IContainer RegisterTest(HttpConfiguration config, IDbContext testContext)
        {
            // IoC AutoFac configuration
            // =========================
            var builder = new ContainerBuilder();

            // Register db context factory
            //ConnectionStringSettings connSettings = ConfigurationManager.ConnectionStrings["DBServices"];
            //builder.RegisterInstance(DbContextFactoryBuilder.Build(connSettings)).As<IDbContextFactory>();
            //builder.RegisterInstance(testContext).As<IDbContext>();


            #region Setup a common pattern

            // Register all existing types

            builder.RegisterAssemblyTypes(typeof(PaymentServices).Assembly)
           .AsImplementedInterfaces()
           .InstancePerRequest();

            // Register all controllers at once
            builder.RegisterApiControllers(Assembly.GetAssembly(typeof(AutofacConfig)));

            //builder.RegisterType<LoggerService>().SingleInstance().AsSelf();
            #endregion Setup a common pattern

            #region Register all controllers for the assembly

            // Register AutoFac filter provider
            builder.RegisterWebApiFilterProvider(config);

            #endregion

            // Set the MVC dependency resolver to use Autofac
            var container = builder.Build();
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);

            return container;
        }
    }
}
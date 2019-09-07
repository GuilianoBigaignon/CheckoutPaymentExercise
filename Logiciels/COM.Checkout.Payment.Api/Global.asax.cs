// Copyright (c) Checkout. All rights reserved.

// *-------------------------------------------------------------------------
// * Object ........: Startup code (mainly for configuration of Dependancy Injection)
// *-------------------------------------------------------------------------

using System;
using System.Configuration;
using System.Web;
using System.Web.Http;

// http://stackoverflow.com/questions/11596352/parser-error-server-error-in-application
namespace COM.Checkout.Payment.Api
{
    /// <summary>
    /// 
    /// </summary>
    public class WebApiApplication : HttpApplication
    {
        /// <summary>
        /// 
        /// </summary>
        protected void Application_Start()
        {
          AutofacConfig.ConfigureContainer();
          GlobalConfiguration.Configuration.EnsureInitialized();
          //LoggerService.NameApplication = ConfigurationManager.AppSettings["NameApplication"] + GetCurentNameSpace();
        }

        /// <summary>
        /// Permet d'obtenir le nom du namespace actuel
        /// </summary>
        /// <returns></returns>
        private string GetCurentNameSpace()
        {
            Type myType = typeof(WebApiApplication);
            return String.Format(".{0}.{1}", myType.Namespace.Split('.')[0], myType.Namespace.Split('.')[1]) ;
        }
    }
}

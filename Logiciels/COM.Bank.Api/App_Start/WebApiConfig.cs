using System.Web;
using System.Web.Http;
using log4net.Config;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using COM.Checkout.Payment.Api.Service.Filters;
using COM.Bank.Api;

[assembly: PreApplicationStartMethod(typeof(WebApiConfig), "RegisterGlobal")]
namespace COM.Bank.Api
{

    /// <summary>
    /// 
    /// </summary>
    public class WebApiConfig
  {
    /// <summary>
    /// 
    /// </summary>
    public static void RegisterGlobal()
    {
      XmlConfigurator.Configure();
      Register(GlobalConfiguration.Configuration);
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="config"></param>
    public static void Register(HttpConfiguration config)
    {
      // Web API configuration and services
      var json = config.Formatters.JsonFormatter;
      json.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
      json.SerializerSettings.DateFormatHandling = DateFormatHandling.IsoDateFormat;
      json.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Unspecified;
      json.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;

      config.Filters.Add(new RequestFilter());
      config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;

      // Web API routes
      config.MapHttpAttributeRoutes();

      config.EnableSystemDiagnosticsTracing();

      // Adding protocol buffers formatter
      // =================================
    }
  }
}

using System;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using System.Web.Http.Description;
using log4net;
using COM.Checkout.Payment.Api.Service;

namespace COM.Checkout.Payment.Api
{
  /// <summary>
  /// Base Controller 
  /// </summary>
  [ApiExplorerSettings(IgnoreApi = false)]
  [RoutePrefix("")] 
  public class BaseController : ApiController
  {
    private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
    private readonly ICommonServices _commonServices;

    /// <summary>
    /// BaseController constructor (IoC)
    /// </summary>
    /// <param name="commonServices"></param>
    public BaseController(ICommonServices commonServices)
    {
      _commonServices = commonServices;
    }

    /// <summary>
    /// Get Global WebServices Status
    /// </summary>
    /// <remarks>
    /// This method is called to retrieve the global web services availability.
    /// </remarks>
    /// <response code="200">Ok</response>
    /// <response code="503">Service unavailable</response>
    [HttpGet]
    [Route("check")]
    public IHttpActionResult Check()
    {
      try
      {
        return Ok(_commonServices.CheckAvailability());
      }
      catch (Exception)
      {
        throw new HttpResponseException(new HttpResponseMessage() { StatusCode = HttpStatusCode.ServiceUnavailable });
      }
    }

    /// <summary>
    /// Get Global WebServices Version
    /// </summary>
    /// <remarks>
    /// This method is called to retrieve the global web services version.
    /// </remarks>
    /// <response code="200">Ok</response>
    /// <response code="500">Internal Server Error</response>
    [HttpGet]
    [Route("version")]
    public IHttpActionResult Version()
    {
      return Ok(_commonServices.GetVersion());
    }

    /// <summary>
    /// Get All Components Versions
    /// </summary>
    /// <remarks>
    /// This method is called to retrieve the web services component versions.
    /// </remarks>
    /// <response code="200">Ok</response>
    /// <response code="500">Internal Server Error</response>
    [HttpGet]
    [Route("versions")]
    public IHttpActionResult Versions()
    {
      return Ok(_commonServices.GetVersions());
    }

    /// <summary>
    /// Test WebServices availability
    /// </summary>
    /// <remarks>
    /// This method is called to retrieve the global web services availability.
    /// </remarks>
    /// <response code="200">Ok</response>
    /// <response code="500">Internal Server Error</response>
    [HttpGet]
    [Route("isalive")]
    public IHttpActionResult IsAlive()
    {
      return Ok();
    }
  }
}
